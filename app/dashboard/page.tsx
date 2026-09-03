/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyOrders, getDashboardStats } from '@/lib/actions/dashboard'
import { getProfile } from '@/lib/actions/profile'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  joined:    'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const [profile, stats, orders] = await Promise.all([
    getProfile(),
    getDashboardStats(),
    getMyOrders(),
  ])

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, {profile?.full_name || 'Buyer'} 👋
        </h1>
        <p className="text-indigo-200 text-sm">{profile?.email}</p>
        {profile?.company_name && (
          <p className="text-indigo-300 text-sm mt-0.5">{profile.company_name}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'text-indigo-700 bg-indigo-50' },
          { label: 'Active Orders', value: stats.activeOrders, icon: '⏳', color: 'text-amber-700 bg-amber-50' },
          { label: 'Total Delivered', value: orders.filter((o: any) => o.status === 'delivered').length, icon: '✅', color: 'text-green-700 bg-green-50' },
          { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: '💰', color: 'text-slate-700 bg-slate-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-semibold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500 text-sm mb-4">Join a buying pool to get started!</p>
            <Link href="/pools" className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
              Browse Active Pools
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order: any) => {
              const product = order.pools?.products
              const total = (order.quantity * order.unit_price_at_join) + (order.logistics_fee_applied || 0)
              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{product?.name || 'Unknown Product'}</p>
                    <p className="text-xs text-slate-500">{order.quantity} units · ₹{total.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
