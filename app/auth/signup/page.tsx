import Link from 'next/link'
import { signup } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function SignupPage() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl shadow-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Create Account</h1>
          <p className="mt-2 text-slate-500">Join Abhartbrands</p>
        </div>

        <form className="mt-8 space-y-4" action={signup}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              name="full_name"
              type="text"
              required
              className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Company Name</label>
            <input
              name="company_name"
              type="text"
              required
              className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              name="phone"
              type="tel"
              required
              className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Delivery Address</label>
            <textarea
              name="address"
              rows={2}
              className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none"
              placeholder="123, Main Street, City, State - 400001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 mt-6 text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 font-semibold transition-colors shadow-lg shadow-indigo-200"
          >
            Sign Up
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-amber-600 hover:text-amber-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
