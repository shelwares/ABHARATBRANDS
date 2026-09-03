/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOrderDetails } from '@/lib/actions/dashboard'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const STATUS_STEPS = [
  { key: 'joined',    label: 'Ordered',      icon: '🛒' },
  { key: 'confirmed', label: 'Confirmed',    icon: '✅' },
  { key: 'shipped',   label: 'Shipped',      icon: '🚚' },
  { key: 'delivered', label: 'Delivered',    icon: '🎉' },
]

const STATUS_ORDER = ['joined', 'confirmed', 'shipped', 'delivered']

const STATUS_COLORS: Record<string, string> = {
  joined:    'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const order = await getOrderDetails(params.orderId)
  if (!order) notFound()

  const pool = order.pools
  const product = pool?.products
  const profile = order.profiles
  const total = (order.quantity * order.unit_price_at_join) + (order.logistics_fee_applied || 0)
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders" className="text-slate-500 hover:text-slate-700 text-sm">
          ← Back to Orders
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{product?.name || 'Order Details'}</h1>
        <p className="text-xs text-slate-400 mt-1">Order ID: {order.id}</p>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Order Timeline</h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, index) => {
              const isDone = currentStatusIndex >= index
              const isCurrent = currentStatusIndex === index
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${isDone ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg relative z-10 ${
                    isDone ? 'bg-indigo-100' : 'bg-slate-100'
                  } ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${isDone ? 'text-indigo-700' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center text-red-700 font-semibold">
          ❌ This order was cancelled.
        </div>
      )}

      {/* Product Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex gap-4 p-6">
          <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-3xl flex-shrink-0">
            {product?.base_image ? (
              <img src={product.base_image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
            ) : '📦'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{product?.name}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product?.description}</p>
            <span className={`mt-3 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Pricing Breakdown</h2>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Quantity</span>
            <span className="font-medium">{order.quantity} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Unit Price (Locked)</span>
            <span className="font-medium">₹{order.unit_price_at_join}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">₹{(order.quantity * order.unit_price_at_join).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Logistics Fee</span>
            <span className="font-medium">{order.logistics_fee_applied > 0 ? `₹${order.logistics_fee_applied}` : 'Free'}</span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-indigo-700">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Delivery Details</h2>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Company</span>
            <span className="font-medium text-slate-900">{profile?.company_name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-900">{profile?.phone || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Address</span>
            <span className="font-medium text-slate-900 text-right max-w-xs">
              {(profile as any)?.address || (
                <Link href="/dashboard/profile" className="text-indigo-600 hover:underline">
                  Add in Profile →
                </Link>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Delivered actions */}
      {order.status === 'delivered' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-900">Order Delivered 🎉</h3>
            <p className="text-sm text-green-700 mt-1">Your order has been delivered successfully.</p>
          </div>
          <button className="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800">
            Download Invoice
          </button>
        </div>
      )}
    </div>
  )
}
