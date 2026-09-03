/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminStats, getAdminPools, getAdminOrders } from '@/lib/actions/admin'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  active:        'bg-green-100 text-green-700',
  manufacturing: 'bg-blue-100 text-blue-700',
  fulfilled:     'bg-indigo-100 text-indigo-700',
  cancelled:     'bg-red-100 text-red-700',
  joined:        'bg-amber-100 text-amber-700',
  confirmed:     'bg-blue-100 text-blue-700',
  shipped:       'bg-indigo-100 text-indigo-700',
  delivered:     'bg-green-100 text-green-700',
}

export default async function AdminDashboard() {
  const [stats, pools, orders] = await Promise.all([
    getAdminStats(),
    getAdminPools(),
    getAdminOrders(),
  ])

  const recentPools = pools.slice(0, 5)
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage products, pools, and orders.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.totalProducts, icon: '🏷️', href: '/admin/products', color: 'text-indigo-700 bg-indigo-50' },
          { label: 'Total Pools',    value: stats.totalPools,    icon: '🤝', href: '/admin/pools',    color: 'text-amber-700 bg-amber-50' },
          { label: 'Total Orders',   value: stats.totalOrders,   icon: '📦', href: '/admin/orders',   color: 'text-green-700 bg-green-50' },
          { label: 'Total Buyers',   value: stats.totalBuyers,   icon: '👥', href: '#',              color: 'text-slate-700 bg-slate-100' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
          + Add Product
        </Link>
        <Link href="/admin/pools/new" className="px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
          + Launch Pool
        </Link>
        <Link href="/admin/orders" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
          Manage Orders
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Pools */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Recent Pools</h2>
            <Link href="/admin/pools" className="text-xs text-indigo-600 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPools.length === 0 && (
              <p className="text-sm text-slate-500 p-6">No pools yet.</p>
            )}
            {recentPools.map((pool: any) => (
              <Link href={`/admin/pools/${pool.id}`} key={pool.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{pool.products?.name}</p>
                  <p className="text-xs text-slate-500">{pool.current_quantity}/{pool.target_quantity} units</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[pool.status] || 'bg-slate-100 text-slate-600'}`}>
                  {pool.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-indigo-600 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 && (
              <p className="text-sm text-slate-500 p-6">No orders yet.</p>
            )}
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{order.pools?.products?.name}</p>
                  <p className="text-xs text-slate-500">{order.profiles?.company_name} · {order.quantity} units</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
