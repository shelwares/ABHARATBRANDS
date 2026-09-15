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
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const full_name = (formData.get('full_name') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const company_name = (formData.get('company_name') as string || '').trim();
    const address = (formData.get('address') as string || '').trim();

    const validatedData = UpdateProfileSchema.safeParse({
      full_name,
      phone,
      company_name,
      address,
    });

    if (!validatedData.success) {
      logger.warn('Profile update validation failed', { userId: user.id });
      return { 
        error: 'Invalid input: ' + validatedData.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
      };
    }

    // Update auth metadata for full_name
    if (full_name) {
      await supabase.auth.updateUser({ data: { full_name } });
    }

    // Upsert profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: full_name || null,
        phone: phone || null,
        company_name: company_name || null,
        address: address || null,
      });

    if (error) {
      logger.error('Profile upsert error', error);
      return { error: 'Failed to update profile. Please try again.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (e: any) {
    logger.error('updateProfile exception', e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function isProfileComplete(): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return false;

    return !!(
      profile.full_name?.trim() &&
      profile.phone?.trim() &&
      profile.address?.trim()
    );
  } catch {
    return false;
  }
}
