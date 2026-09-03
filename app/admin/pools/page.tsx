/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { deletePool, getAdminPools } from "@/lib/actions/admin";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  manufacturing: "bg-blue-100 text-blue-700",
  fulfilled: "bg-indigo-100 text-indigo-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminPoolsPage() {
  const router = useRouter();
  const [pools, setPools] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAdminPools().then(setPools);
  }, []);

  async function handleDelete(poolId: string, productName: string) {
    if (!confirm(`Are you sure you want to delete the pool for "${productName}"? This cannot be undone.`)) return;
    setDeletingId(poolId);
    await deletePool(poolId);
    setDeletingId(null);
    // Refresh list
    getAdminPools().then(setPools);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pools</h1>
          <p className="text-slate-500 text-sm mt-1">{pools.length} pools total</p>
        </div>
        <Link href="/admin/pools/new" className="px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600">
          + Launch Pool
        </Link>
      </div>

      {pools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="font-bold text-slate-900 mb-1">No pools yet</h3>
          <p className="text-slate-500 text-sm mb-4">Launch your first buying pool.</p>
          <Link href="/admin/pools/new" className="inline-block px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600">
            Launch Pool
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-medium">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Progress</th>
                <th className="px-6 py-3 text-left">Deadline</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pools.map((pool: any) => {
                const pct = Math.min(100, Math.round((pool.current_quantity / pool.target_quantity) * 100));
                return (
                  <tr key={pool.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{pool.products?.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{pool.products?.category || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: pct + "%" }} />
                        </div>
                        <span className="text-xs text-slate-600">{pool.current_quantity}/{pool.target_quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(pool.deadline).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[pool.status] || "bg-slate-100 text-slate-600"}`}>
                        {pool.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Link
                        href={`/admin/pools/${pool.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Manage →
                      </Link>
                      <button
                        onClick={() => handleDelete(pool.id, pool.products?.name || "this pool")}
                        disabled={deletingId === pool.id}
                        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                      >
                        {deletingId === pool.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}