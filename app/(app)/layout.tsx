import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AlianzaRH App',
  robots: 'noindex, nofollow',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
