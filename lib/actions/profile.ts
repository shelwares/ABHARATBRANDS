/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '../supabase/server'
import { UpdateProfileSchema } from '../validations'
import { logger } from '../logger'

export async function getProfile() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { ...data, email: user.email, full_name: user.user_metadata?.full_name }
  } catch (error) {
    logger.error('Error fetching profile', error)
    return null
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const company_name = formData.get('company_name') as string
    const address = formData.get('address') as string

    const validatedData = UpdateProfileSchema.safeParse({ phone, company_name, address });
    if (!validatedData.success) {
      logger.warn('Update profile validation failed', { userId: user.id, errors: validatedData.error.issues });
      return { error: 'Invalid input data' };
    }

    // Update auth user metadata
    await supabase.auth.updateUser({ data: { full_name } })

    // Upsert profile row
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        phone: validatedData.data.phone,
        company_name: validatedData.data.company_name,
        address: validatedData.data.address,
      })

    if (error) {
      logger.error('Error updating profile', error)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    logger.error('Update profile action error', error)
    return { error: 'An unexpected error occurred' }
  }
}
