import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { initializeAllertService } from '@/lib/initAllertService'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema Rapporti Consegne',
  description: 'Sistema per la gestione dei rapporti giornalieri delle consegne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inizializza il servizio di allert
  if (typeof window !== 'undefined') {
    initializeAllertService()
  }

  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
