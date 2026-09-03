/* eslint-disable @typescript-eslint/no-explicit-any */
export default function PricingSlabsTable({ tiers, currentQty }: { tiers: any[], currentQty: number }) {
  if (!tiers || tiers.length === 0) return null

  // Ensure tiers are sorted by min_qty
  const sortedTiers = [...tiers].sort((a, b) => a.min_qty - b.min_qty)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Pricing Slabs</h3>
        <p className="text-xs text-slate-500">Price drops automatically as more people join the pool.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
            <tr>
              <th className="px-6 py-3 font-medium">Quantity Range</th>
              <th className="px-6 py-3 font-medium">Price / pc</th>
              <th className="px-6 py-3 font-medium">Logistics Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTiers.map((tier, index) => {
              const nextTier = sortedTiers[index + 1]
              const isLast = !nextTier
              
              // A tier is active if currentQty >= this tier's min_qty 
              // AND (it's the last tier OR currentQty < next tier's min_qty)
              const isActive = currentQty >= tier.min_qty && (isLast || currentQty < nextTier.min_qty)

              return (
                <tr 
                  key={tier.id || index}
                  className={`${isActive ? 'bg-indigo-50/50 relative' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {tier.min_qty} {isLast ? '+' : `- ${nextTier.min_qty - 1}`}
                    {isActive && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-700">
                        Current Active
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 font-bold ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                    ₹{tier.buyer_price}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {tier.logistics_fee ? `₹${tier.logistics_fee}` : 'Free'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
