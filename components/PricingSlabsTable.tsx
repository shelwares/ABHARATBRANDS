/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingSlabsTable({ tiers, currentQty }: { tiers: any[], currentQty: number }) {
  if (!tiers || tiers.length === 0) return null

  // Ensure tiers are sorted by min_qty
  const sortedTiers = [...tiers].sort((a, b) => a.min_qty - b.min_qty)

  return (
    <Card className="overflow-hidden mt-6 p-0 border-0 shadow-sm ring-1 ring-ink-200">
      <div className="px-6 py-4 border-b border-ink-100 bg-ink-50">
        <h3 className="font-semibold text-ink-900 font-display">Pricing Slabs</h3>
        <p className="text-xs text-ink-500 mt-1">Price drops automatically as more people join the pool.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-ink-500 bg-white">
            <tr>
              <th className="px-6 py-4 font-medium border-b border-ink-100">Quantity Range</th>
              <th className="px-6 py-4 font-medium border-b border-ink-100">Price / pc</th>
              <th className="px-6 py-4 font-medium border-b border-ink-100">Logistics Fee</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedTiers.map((tier, index) => {
              const nextTier = sortedTiers[index + 1]
              const isLast = !nextTier
              
              // A tier is active if currentQty >= this tier's min_qty 
              // AND (it's the last tier OR currentQty < next tier's min_qty)
              const isActive = currentQty >= tier.min_qty && (isLast || currentQty < nextTier.min_qty)

              return (
                <tr 
                  key={tier.id || index}
                  className={`transition-colors border-b border-ink-100 last:border-0 ${isActive ? 'bg-brand-primary-50' : 'hover:bg-ink-50'}`}
                >
                  <td className="px-6 py-4 font-medium text-ink-900 flex items-center gap-2">
                    {tier.min_qty} {isLast ? '+' : `- ${nextTier.min_qty - 1}`}
                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-primary-100 text-brand-primary-700">
                        <Check className="w-3 h-3" />
                        Current Active
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 font-bold ${isActive ? 'text-brand-primary-700' : 'text-ink-700'}`}>
                    ₹{tier.buyer_price}
                  </td>
                  <td className="px-6 py-4 text-ink-500">
                    {tier.logistics_fee ? `₹${tier.logistics_fee}` : 'Free'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
