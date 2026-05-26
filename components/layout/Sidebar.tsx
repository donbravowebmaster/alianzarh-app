'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    href: '/leads',
    label: 'Nuevos Leads',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
  },
  {
    href: '/crm',
    label: 'CRM',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/clientes',
    label: 'Clientes / Vacantes',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/cotizador',
    label: 'Cotizador',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Determinar tema inicial al montar
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')

    // Determinar colapso inicial al montar
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    setIsCollapsed(collapsed)
    if (collapsed) {
      document.documentElement.classList.add('sidebar-collapsed')
    } else {
      document.documentElement.classList.remove('sidebar-collapsed')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-[var(--sidebar-width,220px)] bg-white border-r border-gray-100 flex flex-col z-10 select-none transition-all duration-300 ease-in-out">
      {/* Botón de Colapso Flotante (Estilo Yodeck) */}
      <button
        onClick={() => {
          const nextCollapsed = !isCollapsed
          setIsCollapsed(nextCollapsed)
          localStorage.setItem('sidebarCollapsed', String(nextCollapsed))
          if (nextCollapsed) {
            document.documentElement.classList.add('sidebar-collapsed')
          } else {
            document.documentElement.classList.remove('sidebar-collapsed')
          }
        }}
        className="absolute -right-3 top-[32px] -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 hover:text-brand-blue transition-colors cursor-pointer z-50 focus:outline-none"
        title={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo / Brand */}
      <div className={`border-b border-gray-100 flex items-center transition-all duration-300 relative h-16 shrink-0 ${
        isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
      }`}>
        {/* Logo Completo (Visible cuando está expandido) */}
        <div className={`h-8 w-28 relative flex-shrink-0 transition-all duration-300 ${
          isCollapsed 
            ? 'opacity-0 scale-75 w-0 pointer-events-none overflow-hidden' 
            : 'opacity-100 scale-100'
        }`}>
          <img 
            src="/logo-alianza-rh.svg" 
            alt="Alianza RH Logo" 
            className="w-full h-full object-contain dark:brightness-0 dark:invert transition-transform duration-300 hover:scale-103" 
          />
        </div>

        {/* Isotipo (Visible cuando está colapsado) */}
        <div className={`h-8 w-8 relative flex-shrink-0 transition-all duration-300 flex items-center justify-center ${
          isCollapsed 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-75 w-0 pointer-events-none overflow-hidden'
        }`}>
          <img 
            src="/isotipo-alianza-rh.svg" 
            alt="Alianza RH Isotipo" 
            className="w-full h-full object-contain dark:brightness-0 dark:invert transition-transform duration-300 hover:scale-105" 
          />
        </div>
        
        {/* Conmutador de Tema (Modo Oscuro) */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer ${
            isCollapsed ? 'opacity-0 w-0 h-0 p-0 pointer-events-none overflow-hidden' : 'opacity-100'
          }`}
          title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-3 space-y-0.5 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <p className={`px-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all duration-300 ${
          isCollapsed ? 'opacity-0 h-0 py-0 overflow-hidden pointer-events-none' : 'opacity-100'
        }`}>
          Módulos
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg text-sm font-semibold transition-all duration-300 ${
                isCollapsed ? 'justify-center p-2.5 gap-0' : 'gap-2.5 px-2.5 py-2'
              } ${
                isActive
                  ? 'bg-brand-blue/10 text-brand-blue shadow-3xs'
                  : 'text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`transition-all duration-300 ${
                isActive ? 'text-brand-blue' : 'text-gray-400 group-hover:text-brand-blue transition-colors'
              } ${isCollapsed ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-auto'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Sign Out & Footer */}
      <div className={`border-t border-gray-100 space-y-2 shrink-0 transition-all duration-300 ${isCollapsed ? 'p-2' : 'px-3 py-3'}`}>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center rounded-lg text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5 gap-0' : 'gap-2.5 px-2.5 py-2'
          }`}
          title={isCollapsed ? "Cerrar sesión" : undefined}
        >
          <span className="flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
            isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-auto'
          }`}>
            Cerrar sesión
          </span>
        </button>

        {/* Footer / version info */}
        <div className={`px-2 pt-1 text-[9px] text-gray-400 font-medium flex items-center transition-all duration-300 ${
          isCollapsed 
            ? 'opacity-0 h-0 overflow-hidden pointer-events-none' 
            : 'justify-between opacity-100 h-auto'
        }`}>
          <span>© {new Date().getFullYear()} Alianza RH</span>
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-wide">v1.0</span>
        </div>
      </div>
    </aside>
  )
}
