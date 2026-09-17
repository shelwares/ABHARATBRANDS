'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { useRouter } from 'next/navigation'

type Profile = {
  id?: string
  full_name?: string
  email?: string
  phone?: string
  company_name?: string
  address?: string
  address_line1?: string
  address_line2?: string
  area?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  country?: string
}

export default function ProfileForm({ 
  profile, 
  redirectTo = '/dashboard' 
}: { 
  profile: Profile; 
  redirectTo?: string;
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter();

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
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 800);
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              type="text"
              required
              defaultValue={profile?.full_name || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="9876543210"
              defaultValue={profile?.phone || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Name <span className="text-slate-400 text-xs">(optional)</span>
            </label>
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

        {/* Address Line 1 (House/Flat/Building) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Address Line 1 (House/Flat, Building) <span className="text-red-500">*</span>
          </label>
          <input
            name="address_line1"
            defaultValue={profile?.address_line1 || ''}
            required
            placeholder="Flat 201, Shivneri Apartment"
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Address Line 2 (Landmark - optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Address Line 2 (Landmark - optional)
          </label>
          <input
            name="address_line2"
            defaultValue={profile?.address_line2 || ''}
            placeholder="Near City Mall"
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Area & Pincode row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Area / Locality <span className="text-red-500">*</span>
            </label>
            <input
              name="area"
              defaultValue={profile?.area || ''}
              required
              placeholder="MG Road"
              className="w-full border border-slate-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              name="pincode"
              defaultValue={profile?.pincode || ''}
              required
              pattern="\d{6}"
              maxLength={6}
              placeholder="411001"
              className="w-full border border-slate-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* City & District row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              defaultValue={profile?.city || ''}
              required
              placeholder="Pune"
              className="w-full border border-slate-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <input
              name="district"
              defaultValue={profile?.district || ''}
              required
              placeholder="Pune"
              className="w-full border border-slate-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <input
            name="state"
            defaultValue={profile?.state || ''}
            required
            placeholder="Maharashtra"
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Country
          </label>
          <input
            name="country"
            defaultValue={profile?.country || 'India'}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50"
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
