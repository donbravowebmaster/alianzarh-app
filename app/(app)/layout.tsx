import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'AlianzaRH App',
  robots: 'noindex, nofollow',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8f9fa]">{children}</body>
    </html>
  )
}
