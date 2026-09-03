import { getAdminOrders } from '@/lib/actions/admin'
import QcTableClient from './QcTableClient'

export default async function AdminQcPage() {
  const orders = await getAdminOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QC Logging</h1>
          <p className="text-slate-500 text-sm mt-1">Log quality control reports for confirmed orders.</p>
        </div>
      </div>
      <QcTableClient initialOrders={orders} />
    </div>
  )
}
