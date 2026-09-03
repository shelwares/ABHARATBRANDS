'use client'

import Link from 'next/link'
import { resetPassword } from '@/lib/actions/auth'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReset(formData: FormData) {
    setError(null)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl shadow-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Reset Password</h1>
          <p className="mt-2 text-slate-500">Enter your email to reset your password</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 text-center text-green-700 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-lg mb-2">Check your email</h3>
            <p>We have sent a password reset link to your email address.</p>
            <Link 
              href="/auth/login"
              className="inline-block mt-4 text-indigo-600 font-medium hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" action={handleReset}>
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

            <button
              type="submit"
              className="w-full px-4 py-3 text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 font-semibold transition-colors shadow-lg shadow-indigo-200"
            >
              Send Reset Link
            </button>
            
            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
