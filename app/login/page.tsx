'use client'

import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Determinar tema inicial al montar
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
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

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#070a13] font-sans relative overflow-hidden p-4 sm:p-6 transition-colors duration-300">
      {/* Injected custom animations for glowing blobs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.12; transform: scale(1) translate(0px, 0px); }
          50% { opacity: 0.25; transform: scale(1.1) translate(20px, -20px); }
        }
        @keyframes pulse-slow-reverse {
          0%, 100% { opacity: 0.12; transform: scale(1) translate(0px, 0px); }
          50% { opacity: 0.25; transform: scale(1.05) translate(-20px, 20px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
        .animate-pulse-slow-reverse {
          animation: pulse-slow-reverse 12s ease-in-out infinite;
        }
      `}} />

      {/* Selector de Tema en esquina superior derecha de Login */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-gray-400 hover:text-brand-blue hover:bg-slate-50 dark:hover:bg-slate-800/80 backdrop-blur-md shadow-sm transition-all duration-300 cursor-pointer"
          title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Background colorful glowing blobs (visible behind cards) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#357ee3]/10 dark:bg-[#357ee3]/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#c379d8]/10 dark:bg-[#c379d8]/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow-reverse" />

      {/* Main Single Centered Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Decorative elements top and bottom of card */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#357ee3]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#c379d8]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4 transition-transform duration-300 hover:scale-103">
            <img 
              src="/logo-alianza-rh.svg" 
              alt="Alianza RH Logo" 
              className="h-16 w-auto object-contain dark:brightness-0 dark:invert" 
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-3xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              Acceso Interno Autorizado
            </span>
          </div>
        </div>

        {/*LoginForm will load here as glassmorphic */}
        <LoginForm />
        
        {/* Footer info inside app */}
        <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-6 leading-relaxed select-none">
          © {new Date().getFullYear()} Alianza RH. Todos los derechos reservados.<br />
          Uso confidencial únicamente para personal autorizado de AlianzaRH.
        </p>
      </div>
    </main>
  )
}
