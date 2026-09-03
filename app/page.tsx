import Link from 'next/link'
import { getPools } from '@/lib/actions/pool'
import PoolCard from '@/components/PoolCard'

export default async function Home() {
  const pools = await getPools()
  
  // Show max 6 pools on homepage
  const featuredPools = pools?.slice(0, 6) || []

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Factory Rates. <br className="hidden md:block"/>
            <span className="text-amber-500">Without the Factory MOQ.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10">
            Join collective buying pools to unlock direct-from-factory pricing. The more buyers join, the lower the price goes for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/pools"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
            >
              Explore Active Pools &rarr;
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">✓</span>
              Zero Inventory Risk
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">✓</span>
              100% Payment Secure
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">✓</span>
              2-Step Quality Check
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Abhartbrands Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We combine the buying power of hundreds of small businesses to negotiate better rates directly with top manufacturers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Join a Pool</h3>
              <p className="text-slate-600">Browse active product pools and commit to the quantity you need. No upfront payment required to join.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Price Drops</h3>
              <p className="text-slate-600">As more buyers join the pool, the total quantity increases, unlocking cheaper pricing tiers for everyone.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">QC + Delivery</h3>
              <p className="text-slate-600">Once the pool closes, we manufacture, run our strict 2-step quality check, and deliver directly to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Pools Section */}
      <section className="py-24 bg-slate-50 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Active Pools</h2>
              <p className="text-slate-600">Join these pools before they close to get the best rates.</p>
            </div>
            <Link href="/pools" className="hidden sm:block text-indigo-600 font-semibold hover:text-indigo-700">
              View All Pools &rarr;
            </Link>
          </div>
          
          {featuredPools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📦</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No active pools right now</h3>
              <p className="text-slate-500">We are sourcing new products. Check back soon!</p>
            </div>
          )}
          
          <div className="mt-10 text-center sm:hidden">
            <Link href="/pools" className="inline-block text-indigo-600 font-semibold hover:text-indigo-700">
              View All Pools &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
