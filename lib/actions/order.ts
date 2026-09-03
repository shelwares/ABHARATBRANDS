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

export async function joinPool(poolId: string, quantity: number) {
  try {
    const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
    
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    if (!checkRateLimit(ip, `joinPool:${user.id}`, 10, 60 * 1000)) {
      return { error: 'Too many join attempts. Try again later.' };
    }

    const validatedData = JoinPoolSchema.safeParse({ poolId, quantity });
    if (!validatedData.success) {
      logger.warn('Join pool validation failed', { userId: user.id, errors: validatedData.error.errors });
      return { error: 'Invalid input data' };
    }

    // Calculate pricing
    const pricingResult = await getCurrentPrice(validatedData.data.poolId, validatedData.data.quantity)
    if (pricingResult.error) {
      return { error: pricingResult.error }
    }
    
    // 1. Get current pool details
    const { data: pool } = await supabase
      .from('pools')
      .select('current_quantity')
      .eq('id', validatedData.data.poolId)
      .single()
      
    if (!pool) return { error: 'Pool not found' }

    // 2. Insert order
    const { data: order, error: orderError } = await supabase
      .from('pool_orders')
      .insert({
        pool_id: validatedData.data.poolId,
        buyer_id: user.id,
        quantity: validatedData.data.quantity,
        unit_price_at_join: pricingResult.price,
        logistics_fee_applied: pricingResult.logisticsFee,
        status: 'joined' 
      })
      .select('id')
      .single()

    if (orderError) {
      logger.error('Order creation error:', orderError)
      return { error: 'Failed to create order' }
    }

    // 3. Update pool quantity
    const { error: updateError } = await supabase
      .from('pools')
      .update({ current_quantity: pool.current_quantity + validatedData.data.quantity })
      .eq('id', validatedData.data.poolId)

    if (updateError) {
      logger.error('Pool update error:', updateError)
    }

    return { orderId: order.id }
  } catch (error) {
    logger.error('Join pool action error', error)
    return { error: 'An unexpected error occurred' }
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
