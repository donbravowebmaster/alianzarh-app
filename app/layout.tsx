import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RRHH Intranet',
  description: 'Sistema interno de gestión de recursos humanos',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f8f9fa]">{children}</body>
    </html>
  )
}
