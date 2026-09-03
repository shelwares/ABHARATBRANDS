'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              <span className="text-indigo-700">Abhart</span>
              <span className="text-amber-500">brands</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/pools" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              Active Pools
            </Link>
            <Link href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              How it Works
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/dashboard"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
