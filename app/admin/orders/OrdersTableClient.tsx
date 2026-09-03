/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { updateOrderStatus } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = ["joined", "confirmed", "qc_passed", "shipped", "delivered", "cancelled"];

export default function OrdersTableClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setLoadingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-medium">
            <th className="px-4 py-3 text-left">Order ID</th>
            <th className="px-4 py-3 text-left">Company</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Address</th>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Qty</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {initialOrders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-slate-500">No orders found.</td>
            </tr>
          )}
          {initialOrders.map((order: any) => {
            const total = (order.quantity * order.unit_price_at_join) + (order.logistics_fee_applied || 0);
            return (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-mono text-xs text-slate-500">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-4 font-semibold text-slate-900">
                  {order.profiles?.company_name || "—"}
                </td>
                <td className="px-4 py-4 text-slate-600 text-xs">
                  {order.profiles?.phone || "—"}
                </td>
                <td className="px-4 py-4 text-slate-600 text-xs max-w-[160px] truncate" title={order.profiles?.address || ""}>
                  {order.profiles?.address || "—"}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {order.pools?.products?.name || "—"}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {order.quantity}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-900">
                  Rs.{total.toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <select
                    disabled={loadingId === order.id}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}