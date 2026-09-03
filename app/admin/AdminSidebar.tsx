'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

const navItems = [
  { label: 'Overview',  href: '/admin',          icon: '📊' },
  { label: 'Products',  href: '/admin/products',  icon: '🏷️' },
  { label: 'Pools',     href: '/admin/pools',     icon: '🤝' },
  { label: 'Orders',    href: '/admin/orders',    icon: '📦' },
  { label: 'QC',        href: '/admin/qc',        icon: '✅' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="w-60 bg-slate-900 text-slate-200 flex flex-col min-h-full">
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin" className="text-xl font-bold">
          <span className="text-indigo-400">Bharat</span>
          <span className="text-amber-400">Brand</span>
          <span className="ml-2 text-xs font-normal bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Admin</span>
        </Link>
        <p className="text-xs text-slate-500 mt-2 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>🌐</span>
          View Site
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
