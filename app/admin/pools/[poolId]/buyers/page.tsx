/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminPool, getPoolBuyers } from '@/lib/actions/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PoolBuyersPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const [pool, orders] = await Promise.all([
    getAdminPool(poolId),
    getPoolBuyers(poolId),
  ]);

  if (!pool) return notFound();

  const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalValue = orders.reduce(
    (sum, o) =>
      sum + o.quantity * o.unit_price_at_join + (o.logistics_fee_applied || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <Link
        href={`/admin/pools/${poolId}`}
        className="text-slate-500 hover:text-slate-700 text-sm"
      >
        ← Back to Pool
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Buyers for {pool.products?.name}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {orders.length} buyers &bull; {totalQty} units committed &bull; ₹
          {totalValue.toLocaleString('en-IN')} total value
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-medium">
              <th className="px-4 py-3 text-left">Buyer Name</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Quantity</th>
              <th className="px-4 py-3 text-left">Unit Price</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No buyers yet for this pool.
                </td>
              </tr>
            )}
            {orders.map((order: any) => {
              const total =
                order.quantity * order.unit_price_at_join +
                (order.logistics_fee_applied || 0);
              return (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {order.profiles?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.profiles?.company_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <a
                      href={`tel:${order.profiles?.phone}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {order.profiles?.phone || '—'}
                    </a>
                  </td>
                  <td
                    className="px-4 py-3 text-slate-600 max-w-[200px] truncate"
                    title={order.profiles?.address || ''}
                  >
                    {order.profiles?.address || '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {order.quantity}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    ₹{order.unit_price_at_join}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    ₹{total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {orders.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={4} className="px-4 py-3 text-slate-900">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-slate-900">{totalQty} units</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-slate-900">
                  ₹{totalValue.toLocaleString('en-IN')}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
