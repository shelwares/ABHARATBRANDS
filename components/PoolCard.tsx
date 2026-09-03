/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'

type PoolCardProps = {
  pool: any
}

export default function PoolCard({ pool }: PoolCardProps) {
  const product = pool.products
  const progressPercentage = Math.min(100, Math.round((pool.current_quantity / pool.target_quantity) * 100))
  
  // Find current active tier
  let currentPrice = pool.pool_tiers?.[0]?.buyer_price
  if (pool.pool_tiers && pool.pool_tiers.length > 0) {
    const activeTier = pool.pool_tiers.slice().reverse().find((t: any) => pool.current_quantity >= t.min_qty)
    if (activeTier) {
      currentPrice = activeTier.buyer_price
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {product?.base_image ? (
          <img 
            src={product.base_image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            [No Image]
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full text-indigo-700">
          {product?.category || 'General'}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{product?.name}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">{product?.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5 font-medium">
            <span className="text-slate-700">Progress</span>
            <span className="text-indigo-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1.5">
            <span>{pool.current_quantity} ordered</span>
            <span>{pool.target_quantity} goal</span>
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Current Price</p>
            <p className="text-xl font-bold text-slate-900">
              ₹{currentPrice || '---'}
            </p>
          </div>
          <Link 
            href={`/pool/${pool.id}`}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm"
          >
            View Pool
          </Link>
        </div>
      </div>
    </div>
  )
}
