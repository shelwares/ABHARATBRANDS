/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import PricingSlabsTable from '@/components/PricingSlabsTable'
import { getCurrentPrice, joinPool } from '@/lib/actions/order'

export default function PoolDetailClient({ pool }: { pool: any }) {
  const [quantity, setQuantity] = useState<number>(pool.pool_tiers?.[0]?.min_qty || 1)
  const [projectedPrice, setProjectedPrice] = useState<number>(pool.pool_tiers?.[0]?.buyer_price || 0)
  const [logisticsFee, setLogisticsFee] = useState<number>(0)
  const [isJoining, setIsJoining] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()
  
  const product = pool.products
  const progressPercentage = Math.min(100, Math.round((pool.current_quantity / pool.target_quantity) * 100))

  useEffect(() => {
    // Debounce or directly call the server action to get the accurate price
    // Since we also have the tiers locally, we could just calculate it locally as well to save network requests,
    // but the prompt asked to use React useState + useEffect that calls getCurrentPrice.
    let isMounted = true
    
    const fetchPrice = async () => {
      const res = await getCurrentPrice(pool.id, quantity)
      if (isMounted && !res.error && res.price) {
        setProjectedPrice(res.price)
        setLogisticsFee(res.logisticsFee || 0)
      }
    }
    
    // basic debounce
    const timeout = setTimeout(fetchPrice, 300)
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [pool.id, quantity])

  const handleJoinPool = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push(`/auth/login?next=/pool/${pool.id}`)
      return
    }

    setIsJoining(true)
    const result = await joinPool(pool.id, quantity)
    
    if (result.error) {
      alert(`Error joining pool: ${result.error}`)
      setIsJoining(false)
    } else if (result.orderId) {
      router.push(`/checkout/${result.orderId}`)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid md:grid-cols-2 lg:grid-cols-5">
            {/* Left Column: Image & Details */}
            <div className="lg:col-span-3 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product?.category || 'General'}
                </span>
                <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Pool Closes in 5 Days
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{product?.name}</h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {product?.description}
              </p>

              <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-8 border border-slate-200">
                {product?.base_image ? (
                  <img src={product.base_image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-2">📷</span>
                    <span>Product Image</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-semibold text-slate-900">Pool Progress</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-indigo-700">{progressPercentage}%</span>
                      <span className="text-sm text-slate-500 ml-2">Funded</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 mt-3 font-medium">
                    <span>{pool.current_quantity.toLocaleString()} units committed</span>
                    <span>Goal: {pool.target_quantity.toLocaleString()} units</span>
                  </div>
                </div>

                <PricingSlabsTable tiers={pool.pool_tiers} currentQty={pool.current_quantity} />
              </div>
            </div>

            {/* Right Column: Order Form */}
            <div className="lg:col-span-2 bg-slate-50 p-8 md:p-12 flex flex-col">
              <div className="sticky top-24">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Join this Pool</h3>
                
                <form onSubmit={handleJoinPool} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Quantity Required
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        min={pool.pool_tiers?.[0]?.min_qty || 1}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 font-medium">
                        Units
                      </div>
                    </div>
                    {pool.pool_tiers?.[0]?.min_qty && (
                      <p className="text-xs text-slate-500 mt-2">
                        Minimum order quantity: {pool.pool_tiers[0].min_qty} units
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">Estimated Cost</h4>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Projected Price/Unit</span>
                      <span className="font-medium text-slate-900">₹{projectedPrice}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal ({quantity} units)</span>
                      <span className="font-medium text-slate-900">₹{(quantity * projectedPrice).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Logistics Fee</span>
                      <span className="font-medium text-slate-900">
                        {logisticsFee > 0 ? `₹${logisticsFee}` : 'Free'}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-indigo-700">
                        ₹{((quantity * projectedPrice) + logisticsFee).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isJoining}
                    className="w-full py-4 px-6 bg-indigo-700 text-white text-lg font-bold rounded-xl hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isJoining ? 'Joining...' : 'Join Pool Now 🔒'}
                  </button>
                  <p className="text-xs text-center text-slate-500">
                    No payment required until the pool closes.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
