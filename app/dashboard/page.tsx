/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyOrders, getDashboardStats } from '@/lib/actions/dashboard'
import { getProfile } from '@/lib/actions/profile'
import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { Badge, BadgeVariant } from '@/components/ui/badge'
import { FadeIn } from '@/components/motion/fade-in'
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list'
import { Package, Clock, CheckCircle, IndianRupee, ArrowRight, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
      <FadeIn>
        <div className="bg-gradient-to-r from-brand-primary-700 to-brand-primary-900 rounded-2xl p-8 text-white shadow-md">
          <h1 className="text-3xl font-bold mb-1 font-display tracking-tight">
            Welcome back, {profile?.full_name || 'Buyer'} 👋
          </h1>
          <p className="text-brand-primary-200 text-sm">{profile?.email}</p>
          {profile?.company_name && (
            <p className="text-brand-primary-100 text-sm mt-0.5 font-medium">{profile.company_name}</p>
          )}
        </div>
      </FadeIn>

      {/* Stats */}
      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={<Package className="w-5 h-5" />} 
            color="primary" 
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard 
            title="Active Orders" 
            value={stats.activeOrders} 
            icon={<Clock className="w-5 h-5" />} 
            color="warning" 
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard 
            title="Total Delivered" 
            value={orders.filter((o: any) => o.status === 'delivered').length} 
            icon={<CheckCircle className="w-5 h-5" />} 
            color="success" 
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard 
            title="Total Spent" 
            value={stats.totalSpent}
            prefix="₹"
            icon={<IndianRupee className="w-5 h-5" />} 
            color="ink" 
          />
        </StaggerItem>
      </StaggerList>

      {/* Recent Orders */}
      <FadeIn delay={0.2}>
        <Card className="overflow-hidden p-0 border-0 ring-1 ring-ink-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-ink-50">
            <h2 className="font-semibold text-ink-900 font-display">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-primary-600 hover:text-brand-primary-700 font-medium flex items-center">
              View all <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-ink-100 text-ink-400 rounded-full flex items-center justify-center mb-4">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-ink-900 mb-2 text-lg">No orders yet</h3>
              <p className="text-ink-500 text-sm mb-6">Join a buying pool to get started!</p>
              <Button asChild>
                <Link href="/pools">
                  Browse Active Pools
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {recentOrders.map((order: any) => {
                const product = order.pools?.products
                const total = (order.quantity * order.unit_price_at_join) + (order.logistics_fee_applied || 0)
                
                // Map status to badge variant
                const statusVariant = (order.status || 'default') as BadgeVariant

                return (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary-50 text-brand-primary-700 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 truncate">{product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-ink-500 mt-0.5">{order.quantity} units · ₹{total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Badge variant={statusVariant}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-sm font-medium text-brand-primary-600 hover:text-brand-primary-700"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  )
}
