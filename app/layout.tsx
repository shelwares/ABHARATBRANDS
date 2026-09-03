import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Abhartbrands — Factory Rates. Without the Factory MOQ.',
  description: 'Abhartbrands is a D2B aggregation platform...',
}

import '@/lib/env'
import { AuthProvider } from '@/lib/auth/auth-context'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900 flex flex-col`}>
        <AuthProvider initialUser={session?.user ?? null} initialSession={session}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
