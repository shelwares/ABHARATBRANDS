/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminProducts } from '@/lib/actions/admin'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const products = await getAdminProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <Link href="/admin/products/new" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">🏷️</div>
          <h3 className="font-bold text-slate-900 mb-1">No products yet</h3>
          <p className="text-slate-500 text-sm mb-4">Add your first product to get started.</p>
          <Link href="/admin/products/new" className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-medium">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                      {p.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{p.description || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/pools/new?product_id=${p.id}`} className="text-xs font-medium text-amber-600 hover:text-amber-700">
                      Launch Pool →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
