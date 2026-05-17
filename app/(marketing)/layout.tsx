import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AlianzaRH — Soluciones de Reclutamiento',
  description: 'Conectamos talento con las mejores oportunidades.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
