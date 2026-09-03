'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'

type Profile = {
  id?: string
  full_name?: string
  email?: string
  phone?: string
  company_name?: string
  address?: string
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setMessage(null)
    setError(null)
    const result = await updateProfile(formData)
    setIsPending(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setMessage('Profile updated successfully!')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">Edit Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Update your details for accurate deliveries.</p>
      </div>
      <form action={handleSubmit} className="p-6 space-y-5">
        {message && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">{message}</div>
        )}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile?.full_name || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input
              name="company_name"
              type="text"
              defaultValue={profile?.company_name || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
          <textarea
            name="address"
            rows={3}
            defaultValue={profile?.address || ''}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
            placeholder="Building, Street, City, State, PIN"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors text-sm disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
