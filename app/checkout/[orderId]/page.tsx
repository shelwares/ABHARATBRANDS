/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOrderById } from '@/lib/actions/order'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CheckoutPage({ params }: { params: { orderId: string } }) {
  const order = await getOrderById(params.orderId)

  if (!order) {
    notFound()
  }

  const pool = order.pools
  const product = pool?.products
  const profile = order.profiles

  const total = (order.quantity * order.unit_price_at_join) + (order.logistics_fee_applied || 0)

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pool Joined!</h1>
          <p className="text-slate-500">Your order is confirmed. Review the details below.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Order Summary</h2>
            <p className="text-xs text-slate-500">Order ID: {order.id}</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Product</span>
              <span className="font-semibold text-slate-900">{product?.name || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Quantity</span>
              <span className="font-semibold text-slate-900">{order.quantity} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Unit Price (Locked)</span>
              <span className="font-semibold text-slate-900">₹{order.unit_price_at_join}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-semibold text-slate-900">₹{(order.quantity * order.unit_price_at_join).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Logistics Fee</span>
              <span className="font-semibold text-slate-900">
                {order.logistics_fee_applied > 0 ? `₹${order.logistics_fee_applied}` : 'Free'}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-900 font-bold text-lg">Total Amount</span>
              <span className="text-3xl font-bold text-indigo-700">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Delivery Details</h2>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Company</span>
              <span className="font-medium text-slate-900">{profile?.company_name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium text-slate-900">{profile?.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Address</span>
              <span className="font-medium text-slate-900 text-right max-w-xs">Update in dashboard</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
          <strong>What happens next?</strong> The pool will continue to accept orders until the target quantity is reached or the deadline passes. Once closed, manufacturing begins. Payment is collected before shipment.
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 py-4 text-center bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/pools"
            className="flex-1 py-4 text-center bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Browse More Pools
          </Link>
        </div>
      </div>
    </div>
  )
}
