import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800']
});
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-body' 
});
const mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

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
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider initialUser={session?.user ?? null} initialSession={session}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
