import { requireAdmin } from '@/lib/actions/admin'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <div className="hidden md:block sticky top-0 h-screen">
          <AdminSidebar />
        </div>
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
