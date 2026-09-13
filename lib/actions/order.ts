/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { getSupabaseServerClient } from '../supabase/server'
import { JoinPoolSchema } from '../validations'
import { logger } from '../logger'
import { checkRateLimit } from '../rate-limit'
import { headers } from 'next/headers'

export async function getCurrentPrice(poolId: string, additionalQuantity: number) {
  try {
    const supabase = await getSupabaseServerClient()
    
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('current_quantity')
      .eq('id', poolId)
      .single()

    if (poolError || !pool) {
      return { error: 'Pool not found' }
    }

    const projectedQuantity = pool.current_quantity + additionalQuantity

    const { data: tiers, error: tiersError } = await supabase
      .from('pool_tiers')
      .select('*')
      .eq('pool_id', poolId)
      .order('min_qty', { ascending: true })

    if (tiersError || !tiers || tiers.length === 0) {
      return { error: 'Pricing tiers not found' }
    }

    let activeTier = tiers[0]
    for (const tier of tiers) {
      if (projectedQuantity >= tier.min_qty) {
        activeTier = tier
      }
    }

    return {
      price: activeTier.buyer_price,
      logisticsFee: activeTier.logistics_fee || 0,
      projectedQuantity
    }
  } catch (error) {
    logger.error('Error fetching current price', error);
    return { error: 'An unexpected error occurred' };
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
    console.log('4. Tier calculated:', JSON.stringify(tier));
    if (!tier) {
      console.log('4a. NO TIER FOUND');
      return { error: 'No tier found for this quantity' };
    }
    
    const insertData = {
      pool_id: poolId,
      buyer_id: user.id,
      quantity,
      unit_price_at_join: tier.price,
      logistics_fee_applied: tier.logisticsFee,
      status: 'joined',
    };
    console.log('5. Insert data:', JSON.stringify(insertData));
    
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
