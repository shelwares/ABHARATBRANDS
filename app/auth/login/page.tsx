import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl shadow-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Welcome Back</h1>
          <p className="mt-2 text-slate-500">Sign in to your Abhartbrands account</p>
        </div>

        {searchParams?.message && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {searchParams.message}
          </div>
        )}

        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 font-semibold transition-colors shadow-lg shadow-indigo-200"
          >
            Sign In
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-amber-600 hover:text-amber-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
