/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { getSupabaseServerClient } from '../supabase/server'
import { JoinPoolSchema } from '../validations'
import { logger } from '../logger'
import { checkRateLimit } from '../rate-limit'
import { headers } from 'next/headers'

export async function getCurrentPrice(poolId: string, quantity: number) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: pool, error } = await supabase
      .from('pools')
      .select('current_quantity, pool_tiers(*)')
      .eq('id', poolId)
      .maybeSingle();

    if (error) {
      console.log('getCurrentPrice error:', error.message);
      return null;
    }
    if (!pool || !pool.pool_tiers || pool.pool_tiers.length === 0) {
      console.log('No pool or tiers found');
      return null;
    }

    const projectedQty = (pool.current_quantity || 0) + quantity;
    const sortedTiers = [...pool.pool_tiers].sort((a, b) => a.min_qty - b.min_qty);

    // Find the tier where projectedQty >= min_qty
    let applicableTier = sortedTiers[0];
    for (const tier of sortedTiers) {
      if (projectedQty >= tier.min_qty) {
        applicableTier = tier;
      }
    }

    console.log('Applicable tier:', JSON.stringify(applicableTier));
    console.log('buyer_price:', applicableTier.buyer_price, 'logistics_fee:', applicableTier.logistics_fee);

    // Validate — buyer_price must exist
    if (!applicableTier || applicableTier.buyer_price === null || applicableTier.buyer_price === undefined) {
      console.log('INVALID TIER — buyer_price missing');
      return null;
    }

    return {
      buyer_price: Number(applicableTier.buyer_price),
      logistics_fee: Number(applicableTier.logistics_fee) || 0,
    };
  } catch (e: any) {
    console.log('getCurrentPrice exception:', e.message);
    return null;
  }
}

import { revalidatePath } from 'next/cache';

export async function joinPool(poolId: string, quantity: number) {
  console.log('=== JOIN POOL START ===');
  console.log('poolId:', poolId);
  console.log('quantity:', quantity);
  
  try {
    const supabase = await getSupabaseServerClient();
    console.log('1. Supabase client created');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('2. Auth check - user:', user?.id, 'authError:', authError?.message);
    if (!user) {
      console.log('2a. NOT AUTHENTICATED - returning');
      return { error: 'Not authenticated' };
    }
    
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*, pool_tiers(*)')
      .eq('id', poolId)
      .maybeSingle();
    console.log('3. Pool fetch - pool:', pool?.id, 'error:', poolError?.message);
    console.log('3a. Pool tiers count:', pool?.pool_tiers?.length);
    if (!pool) {
      console.log('3b. POOL NOT FOUND');
      return { error: 'Pool not found' };
    }
    
    const tier = await getCurrentPrice(poolId, quantity);
    console.log('Tier returned:', JSON.stringify(tier));
    
    if (!tier || tier.buyer_price === null || tier.buyer_price === undefined) {
      console.log('BLOCKING INSERT: tier.buyer_price is null/undefined');
      return { error: 'Pricing not available for this pool. Please contact support.' };
    }
    
    const insertData = {
      pool_id: poolId,
      buyer_id: user.id,
      quantity,
      unit_price_at_join: Number(tier.buyer_price), // Force number
      logistics_fee_applied: Number(tier.logistics_fee) || 0,
      status: 'joined',
    };
    console.log('Final insert data:', JSON.stringify(insertData));
    
    const { data: order, error: insertError } = await supabase
      .from('pool_orders')
      .insert(insertData)
      .select()
      .maybeSingle();
    
    console.log('6. Insert result - order:', order?.id);
    console.log('6a. Insert error:', JSON.stringify(insertError));
    console.log('6b. Insert error message:', insertError?.message);
    console.log('6c. Insert error code:', insertError?.code);
    console.log('6d. Insert error hint:', insertError?.hint);
    console.log('6e. Insert error details:', insertError?.details);
    
    if (insertError) {
      console.log('7. INSERT FAILED - returning error');
      return { 
        error: `DB: ${insertError.message} (code: ${insertError.code})` 
      };
    }
    
    console.log('8. Update pool quantity');
    const { error: updateError } = await supabase
      .from('pools')
      .update({ current_quantity: (pool.current_quantity || 0) + quantity })
      .eq('id', poolId);
    console.log('8a. Update error:', updateError?.message);
    
    console.log('9. SUCCESS! Order ID:', order?.id);
    revalidatePath('/dashboard');
    return { orderId: order?.id };
  } catch (e: any) {
    console.log('10. EXCEPTION CAUGHT:', e.message);
    console.log('10a. Stack:', e.stack);
    return { error: e.message };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('pool_orders')
      .select(`
        *,
        pools (
          *,
          products (*)
        ),
        profiles (*)
      `)
      .eq('id', orderId)
      .eq('buyer_id', user.id) 
      .single()

    if (error) {
      logger.error('Error fetching order:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error in getOrderById', error);
    return null;
  }
}
