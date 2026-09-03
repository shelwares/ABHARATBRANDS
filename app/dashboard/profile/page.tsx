import { getProfile } from '@/lib/actions/profile'
import ProfileForm from '../ProfileForm'

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and delivery details.</p>
      </div>

      {/* Account info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
            {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'B'}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile?.full_name || '—'}</p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Phone</span>
            <p className="font-medium text-slate-900 mt-0.5">{profile?.phone || '—'}</p>
          </div>
          <div>
            <span className="text-slate-500">Company</span>
            <p className="font-medium text-slate-900 mt-0.5">{profile?.company_name || '—'}</p>
          </div>
        </div>
      </div>

      {profile && <ProfileForm profile={profile} />}
    </div>
  )
}
