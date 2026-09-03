/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { getSupabaseServerClient } from '../supabase/server'
import { logger } from '../logger'

export async function getPools() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from('pools')
      .select(`
        *,
        products (
          name,
          description,
          base_image,
          category
        ),
        pool_tiers (
          min_qty,
          buyer_price
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching pools:', error)
      return []
    }

    return data
  } catch (error) {
    logger.error('Error in getPools', error)
    return []
  }
}

export async function getPoolById(id: string) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from('pools')
      .select(`
        *,
        products (*),
        pool_tiers (*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching pool by id:', error)
      return null
    }

    if (data?.pool_tiers) {
      data.pool_tiers.sort((a: any, b: any) => a.min_qty - b.min_qty)
    }

    return data
  } catch (error) {
    logger.error('Error in getPoolById', error)
    return null
  }
}
