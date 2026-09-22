"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

type Tier = {
  id: string;
  min_qty: number;
  max_qty: number;
  buyer_price: number;
  logistics_fee: number;
};

interface Props {
  tiers: Tier[];
  currentPoolQty: number;
  buyerQty: number;
}

export default function PricingSlabsTable({ tiers, currentPoolQty, buyerQty }: Props) {
  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  const projectedQty = currentPoolQty + buyerQty;

  // Which tier applies for PRODUCT PRICE (based on projected pool total)
  let priceTierId: string | null = null;
  for (const t of sorted) {
    if (projectedQty >= t.min_qty) priceTierId = t.id;
  }

  // Which tier applies for DELIVERY FEE (based on buyer's own qty)
  let deliveryTierId: string | null = null;
  for (const t of sorted) {
    if (buyerQty >= t.min_qty) deliveryTierId = t.id;
  }

  const getDeliveryColor = (fee: number) => {
    if (fee === 0) return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
    if (fee <= 25) return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
    return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
  };

  const deliveryFeeForBuyer =
    sorted.find((t) => t.id === deliveryTierId)?.logistics_fee ?? 0;
  const deliveryColor = getDeliveryColor(deliveryFeeForBuyer);

  return (
    <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden mt-6 shadow-sm ring-1 ring-ink-200">
      <div className="px-6 py-4 border-b border-ink-100 bg-ink-50">
        <h3 className="text-base font-bold text-ink-900 font-display">Pricing Slabs</h3>
        <p className="text-xs text-ink-500 mt-1">
          Product price drops as the pool grows. Delivery fee depends on your quantity.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-ink-500 bg-white">
            <tr>
              <th className="px-6 py-4 font-medium border-b border-ink-100">Quantity Range</th>
              <th className="px-6 py-4 font-medium border-b border-ink-100">Price / pc</th>
              <th className="px-6 py-4 font-medium border-b border-ink-100">Delivery Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {sorted.map((tier, index) => {
              const nextTier = sorted[index + 1];
              const isLast = !nextTier;
              const isPriceTier = tier.id === priceTierId;
              const isDeliveryTier = tier.id === deliveryTierId;
              const dColor = getDeliveryColor(tier.logistics_fee);

              return (
                <tr
                  key={tier.id || index}
                  className={`transition-colors border-b border-ink-100 last:border-0 ${
                    isPriceTier ? "bg-brand-primary-50" : "hover:bg-ink-50"
                  }`}
                >
                  <td className="px-6 py-4 font-semibold text-ink-900">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>
                        {tier.min_qty} {isLast ? '+' : `- ${nextTier.min_qty - 1}`}
                      </span>

                      {isPriceTier && (
                        <motion.span
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-primary-100 text-brand-primary-700"
                        >
                          <Check className="w-3 h-3" />
                          Price Tier
                        </motion.span>
                      )}

                      {isDeliveryTier && !isPriceTier && (
                        <motion.span
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${dColor.bg} ${dColor.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dColor.dot}`} />
                          Delivery Tier
                        </motion.span>
                      )}

                      {isPriceTier && isDeliveryTier && (
                        <motion.span
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Both
                        </motion.span>
                      )}
                    </div>
                  </td>

                  <td className={`px-6 py-4 ${isPriceTier ? "font-bold text-brand-primary-700" : "font-semibold text-ink-700"}`}>
                    ₹{tier.buyer_price}
                  </td>

                  <td className="px-6 py-4">
                    <motion.span
                      key={`${tier.id}-${deliveryFeeForBuyer}`}
                      initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                      animate={{
                        backgroundColor:
                          tier.logistics_fee === 0
                            ? "rgba(16, 185, 129, 0.08)"
                            : "rgba(0,0,0,0)",
                      }}
                      transition={{ duration: 0.4 }}
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        tier.logistics_fee === 0 ? "text-emerald-700 bg-emerald-50" : "text-ink-700"
                      }`}
                    >
                      {tier.logistics_fee === 0 ? "Free" : `₹${tier.logistics_fee}`}
                    </motion.span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-ink-100 bg-ink-50 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-primary-500" />
          <span className="text-ink-600">
            Price tier (based on pool total: <strong>{projectedQty}</strong>)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${deliveryColor.dot}`} />
          <span className="text-ink-600">
            Your delivery tier (based on <strong>{buyerQty}</strong> units)
          </span>
        </div>
      </div>
    </div>
  );
}
