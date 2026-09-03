/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../supabase/server'
import { logger } from '../logger'

// ─── Admin Guard ───────────────────────────────────────────────────────────────
export async function requireAdmin() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || profile?.role !== 'admin') {
      logger.warn('Unauthorized admin access attempt', { userId: user.id });
      redirect('/')
    }
    return user
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in requireAdmin', error);
    redirect('/');
  }
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────────
export async function getAdminStats() {
  try {
    const supabase = await getSupabaseServerClient()
    const [products, pools, orders, buyers] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('pools').select('id', { count: 'exact', head: true }),
      supabase.from('pool_orders').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
    ])
    return {
      totalProducts: products.count || 0,
      totalPools: pools.count || 0,
      totalOrders: orders.count || 0,
      totalBuyers: buyers.count || 0,
    }
  } catch (error) {
    logger.error('Error in getAdminStats', error);
    return { totalProducts: 0, totalPools: 0, totalOrders: 0, totalBuyers: 0 };
  }
}

// ─── Products ──────────────────────────────────────────────────────────────────
export async function getAdminProducts() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  } catch (error) {
    logger.error('Error in getAdminProducts', error);
    return [];
  }
}

export async function createProduct(formData: FormData) {
  try {
    await requireAdmin()
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.from('products').insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      base_image: formData.get('base_image') as string || null,
    })

    if (error) {
      logger.error('Error creating product', error);
      return { error: 'Failed to create product' }
    }
    revalidatePath('/admin/products')
    redirect('/admin/products')
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in createProduct', error);
    return { error: 'An unexpected error occurred' };
  }
}

// ─── Pools ────────────────────────────────────────────────────────────────────
export async function getAdminPools() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data } = await supabase
      .from('pools')
      .select(`*, products(name, category)`)
      .order('created_at', { ascending: false })
    return data || []
  } catch (error) {
    logger.error('Error in getAdminPools', error);
    return [];
  }
}

export async function getAdminPool(poolId: string) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data } = await supabase
      .from('pools')
      .select(`*, products(*), pool_tiers(*)`)
      .eq('id', poolId)
      .single()
    if (data?.pool_tiers) {
      data.pool_tiers.sort((a: any, b: any) => a.min_qty - b.min_qty)
    }
    return data
  } catch (error) {
    logger.error('Error in getAdminPool', error);
    return null;
  }
}

export async function createPool(formData: FormData) {
  try {
    await requireAdmin()
    const supabase = await getSupabaseServerClient()

    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .insert({
        product_id: formData.get('product_id') as string,
        target_quantity: parseInt(formData.get('target_quantity') as string),
        deadline: formData.get('deadline') as string,
        status: 'active',
      })
      .select('id')
      .single()

    if (poolError) {
      logger.error('Error creating pool', poolError);
      return { error: 'Failed to create pool' }
    }

    const tierCount = parseInt(formData.get('tier_count') as string || '1')
    const tiers = []
    for (let i = 1; i <= tierCount; i++) {
      const min_qty = parseInt(formData.get(`tier_min_${i}`) as string)
      const buyer_price = parseFloat(formData.get(`tier_price_${i}`) as string)
      const logistics_fee = parseFloat(formData.get(`tier_logistics_${i}`) as string || '0')
      if (!isNaN(min_qty) && !isNaN(buyer_price)) {
        tiers.push({ pool_id: pool.id, min_qty, max_qty: 99999, buyer_price, logistics_fee })
      }
    }

    if (tiers.length > 0) {
      await supabase.from('pool_tiers').insert(tiers)
    }

    revalidatePath('/admin/pools')
    redirect('/admin/pools')
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in createPool', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function deletePool(poolId: string) {
  try {
    await requireAdmin()
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from('pools')
      .delete()
      .eq('id', poolId)
    if (error) {
      logger.error('Error deleting pool', error);
      return { error: 'Failed to delete pool' }
    }
    revalidatePath('/admin/pools')
    return { success: true }
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in deletePool', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updatePoolStatus(poolId: string, status: string) {
  try {
    await requireAdmin()
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from('pools')
      .update({ status })
      .eq('id', poolId)
    if (error) {
      logger.error('Error updating pool status', error);
      return { error: 'Failed to update pool' }
    }
    revalidatePath('/admin/pools')
    revalidatePath(`/admin/pools/${poolId}`)
    return { success: true }
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in updatePoolStatus', error);
    return { error: 'An unexpected error occurred' };
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getAdminOrders() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data } = await supabase
      .from('pool_orders')
      .select(`
        *,
        pools ( id, products ( name ) ),
        profiles ( company_name, phone, address )
      `)
      .order('created_at', { ascending: false })
    return data || []
  } catch (error) {
    logger.error('Error in getAdminOrders', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await requireAdmin()
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from('pool_orders')
      .update({ status })
      .eq('id', orderId)
    if (error) {
      logger.error('Error updating order status', error);
      return { error: 'Failed to update order' }
    }
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in updateOrderStatus', error);
    return { error: 'An unexpected error occurred' };
  }
}

// ─── QC Reports ───────────────────────────────────────────────────────────────
export async function logQC(orderId: string, qc_status: string, remarks: string) {
  try {
    await requireAdmin()
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('qc_reports').insert({
      pool_order_id: orderId,
      qc_status: qc_status,
      remarks: remarks,
      checked_by: user?.id || 'admin',
    })

    if (error) {
      logger.error('Error logging QC', error);
      return { error: 'Failed to log QC' }
    }

    const nextStatus = qc_status === 'passed' ? 'shipped' : 'confirmed'
    await supabase.from('pool_orders').update({ status: nextStatus }).eq('id', orderId)

    revalidatePath('/admin/orders')
    revalidatePath('/admin/qc')
    return { success: true }
  } catch (error) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;
    logger.error('Error in logQC', error);
    return { error: 'An unexpected error occurred' };
  }
}
