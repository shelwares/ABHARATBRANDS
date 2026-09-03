/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { logQC } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function QcTableClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [status, setStatus] = useState('passed')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  const qcOrders = initialOrders.filter((o: any) => o.status === 'confirmed')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrderId) return
    setLoading(true)
    await logQC(selectedOrderId, status, remarks)
    setSelectedOrderId(null)
    setRemarks('')
    setStatus('passed')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-medium">
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">Qty</th>
              <th className="px-6 py-3 text-left">Current Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {qcOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No orders ready for QC.</td>
              </tr>
            )}
            {qcOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{order.id.slice(0, 8)}...</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{order.pools?.products?.name || '—'}</td>
                <td className="px-6 py-4 text-slate-700">{order.quantity}</td>
                <td className="px-6 py-4 text-slate-700">{order.status}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg hover:bg-indigo-100"
                  >
                    Log QC
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Log QC Report</h2>
            <p className="text-sm text-slate-500 mb-6">Order ID: {selectedOrderId}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">QC Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="passed">Pass</option>
                  <option value="failed">Fail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Remarks</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save QC Report'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedOrderId(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
