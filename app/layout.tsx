import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AlianzaRH App',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          try {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
            if (localStorage.sidebarCollapsed === 'true') {
              document.documentElement.classList.add('sidebar-collapsed')
            } else {
              document.documentElement.classList.remove('sidebar-collapsed')
            }
          } catch (_) {}
        `}} />
      </head>
      <body className="min-h-screen bg-[#f4f7fc] text-[#0d1117] dark:bg-[#070a13] dark:text-[#f8fafc] transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}
