import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'AlianzaRH — Soluciones de Reclutamiento',
  description: 'Conectamos talento con las mejores oportunidades.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
