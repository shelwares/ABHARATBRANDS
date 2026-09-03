import { getAdminOrders } from '@/lib/actions/admin'
import OrdersTableClient from './OrdersTableClient'

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
          <p className="text-slate-500 text-sm mt-1">View and update buyer orders.</p>
        </div>
      </div>
      <OrdersTableClient initialOrders={orders} />
    </div>
  )
}
