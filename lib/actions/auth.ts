'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../supabase/server'
import { LoginSchema, SignupSchema, ResetPasswordSchema } from '../validations'
import { logger } from '../logger'
import { loginLimiter, signupLimiter, resetLimiter, getClientIp } from '@/lib/rate-limit';
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  try {
    const ip = await getClientIp();
    const email = (formData.get('email') as string || '').toLowerCase().trim();
    if (loginLimiter) {
      const { success } = await loginLimiter.limit(`${ip}:${email}`);
      if (!success) return redirect('/auth/login?message=Too many login attempts. Try again in 15 minutes.');
    }
    const password = formData.get('password') as string

    const validatedData = LoginSchema.safeParse({ email, password });
    if (!validatedData.success) {
      logger.warn('Login validation failed', { ip, errors: validatedData.error.issues });
      return redirect(`/auth/login?message=Invalid input data`)
    }

    const supabase = await getSupabaseServerClient()
    const { error, data } = await supabase.auth.signInWithPassword({
      email: validatedData.data.email,
      password: validatedData.data.password,
    })

    if (error || !data.user) {
      logger.warn('Failed login attempt', { email: validatedData.data.email, ip });
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        return redirect(`/auth/login?message=${encodeURIComponent('Please confirm your email first. Check your inbox.')}`);
      }
      return redirect(`/auth/login?message=${encodeURIComponent('Invalid email or password')}`);
    }

    // Fetch profile to determine role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

    logger.info('User logged in', { email: validatedData.data.email, ip });
    revalidatePath('/', 'layout')
    
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  } catch (error: any) {
    // redirect() throws a special error — must rethrow so Next.js handles it
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    logger.error('Login action error', error);
    return redirect(`/auth/login?message=An unexpected error occurred`)
  }
}

export async function signup(formData: FormData) {
  try {
    const ip = await getClientIp();
    if (signupLimiter) {
      const { success } = await signupLimiter.limit(ip);
      if (!success) return { error: 'Too many attempts. Try again later.' };
    }

    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const password = formData.get('password') as string;
    const full_name = (formData.get('full_name') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const company_name = (formData.get('company_name') as string || '').trim();
    const address = (formData.get('address') as string || '').trim();

    const validated = SignupSchema.safeParse({ email, password, full_name, phone, company_name });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.full_name,
          phone: validated.data.phone,
          company_name: validated.data.company_name,
          address,
        },
      },
    });

    if (error) {
      logger.error('Signup error', { error: error.message });
      // Privacy: never expose whether email exists
      return { error: 'Unable to create account. Please try again or contact support.' };
    }

    // Success — user must check email to confirm
    return { success: 'Account created! Please check your email to confirm before signing in.' };
  } catch (e: any) {
    logger.error('Signup exception', { error: e.message });
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function resetPassword(formData: FormData) {
  try {
    // Rate limiting
    const ip = await getClientIp();
    if (resetLimiter) {
      const { success } = await resetLimiter.limit(ip);
      if (!success) return { error: 'Too many reset attempts. Try again in 15 minutes.' };
    }

    // Validation
    const email = formData.get('email') as string;
    const validated = ResetPasswordSchema.safeParse({ email });
    if (!validated.success) {
      return { error: 'Invalid email address' };
    }

    const supabase = await getSupabaseServerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      validated.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      }
    );

    if (error) {
      logger.error('Password reset error', { error: error.message });
      return { error: 'Failed to send reset email' };
    }

    return { success: true };
  } catch (error) {
    logger.error('Password reset error', error);
    return { error: 'Something went wrong' };
  }
}

export async function logout() {
  try {
    const supabase = await getSupabaseServerClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    logger.error('Logout action error', error);
    redirect('/')
  }
}
