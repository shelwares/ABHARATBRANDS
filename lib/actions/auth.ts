'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '../supabase/server'
import { LoginSchema, SignupSchema } from '../validations'
import { logger } from '../logger'
import { checkRateLimit } from '../rate-limit'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  try {
    const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip, 'login', 5, 15 * 60 * 1000)) {
      return redirect('/auth/login?message=Too many login attempts. Try again later.')
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validatedData = LoginSchema.safeParse({ email, password });
    if (!validatedData.success) {
      logger.warn('Login validation failed', { ip, errors: validatedData.error.issues });
      return redirect(`/auth/login?message=Invalid input data`)
    }

    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.data.email,
      password: validatedData.data.password,
    })

    if (error) {
      logger.warn('Failed login attempt', { email: validatedData.data.email, ip });
      return redirect(`/auth/login?message=${encodeURIComponent(error.message)}`)
    }

    logger.info('User logged in', { email: validatedData.data.email, ip });
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    logger.error('Login action error', error);
    return redirect(`/auth/login?message=An unexpected error occurred`)
  }
}

export async function signup(formData: FormData) {
  try {
    const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip, 'signup', 3, 60 * 60 * 1000)) {
      return redirect('/auth/signup?message=Too many signup attempts. Try again later.')
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const company_name = formData.get('company_name') as string
    const address = formData.get('address') as string
    
    const validatedData = SignupSchema.safeParse({ email, password, phone, company_name });
    if (!validatedData.success) {
      logger.warn('Signup validation failed', { ip, errors: validatedData.error.issues });
      return redirect(`/auth/signup?message=Invalid input data`)
    }

    const supabase = await getSupabaseServerClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: validatedData.data.email,
      password: validatedData.data.password,
      options: {
        data: {
          full_name,
          phone: validatedData.data.phone,
          company_name: validatedData.data.company_name,
        }
      }
    })

    if (error) {
      logger.warn('Failed signup attempt', { email: validatedData.data.email, ip });
      return redirect(`/auth/signup?message=${encodeURIComponent(error.message)}`)
    }

    if (authData?.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        phone: validatedData.data.phone,
        company_name: validatedData.data.company_name,
        address,
        role: 'buyer',
      })
    }

    logger.info('User signed up', { email: validatedData.data.email, ip });
    redirect('/auth/login?message=Account created successfully! Please sign in.')
  } catch (error) {
    logger.error('Signup action error', error);
    return redirect(`/auth/signup?message=An unexpected error occurred`)
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      return { error: error.message }
    }
    return { success: true }
  } catch (error) {
    logger.error('Reset password action error', error);
    return { error: 'An unexpected error occurred' }
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
