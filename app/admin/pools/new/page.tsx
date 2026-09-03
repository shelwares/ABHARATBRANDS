/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { createPool } from '@/lib/actions/admin'
import { getAdminProducts } from '@/lib/actions/admin'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function NewPoolPage({ searchParams }: { searchParams: { product_id?: string } }) {
  const [products, setProducts] = useState<any[]>([])
  const [tierCount, setTierCount] = useState(3)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminProducts().then(setProducts)
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('tier_count', String(tierCount))
    const result = await createPool(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/pools" className="text-slate-500 hover:text-slate-700 text-sm">← Back</Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Launch New Pool</h1>
        <p className="text-slate-500 text-sm mt-1">Create a buying pool with pricing tiers.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>
        )}
        <form action={handleSubmit} className="space-y-6">
          {/* Product */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Product *</label>
            <select
              name="product_id"
              required
              defaultValue={searchParams.product_id || ''}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
            >
              <option value="">Select a product...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Target Quantity *</label>
              <input
                name="target_quantity"
                required
                type="number"
                min="1"
                placeholder="e.g. 1000"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Deadline *</label>
              <input
                name="deadline"
                required
                type="datetime-local"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Pricing Tiers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-900">Pricing Tiers</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setTierCount(Math.max(1, tierCount - 1))} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 text-sm font-bold">−</button>
                <button type="button" onClick={() => setTierCount(Math.min(5, tierCount + 1))} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 text-sm font-bold">+</button>
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: tierCount }, (_, i) => i + 1).map((n) => (
                <div key={n} className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Min Qty (Tier {n})</label>
                    <input
                      name={`tier_min_${n}`}
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      defaultValue={n === 1 ? 1 : undefined}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Price / pc (₹)</label>
                    <input
                      name={`tier_price_${n}`}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 299"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Logistics (₹)</label>
                    <input
                      name={`tier_logistics_${n}`}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      defaultValue="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white font-semibold text-sm rounded-lg hover:bg-amber-600 transition-colors">
              Launch Pool
            </button>
            <Link href="/admin/pools" className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-200 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
