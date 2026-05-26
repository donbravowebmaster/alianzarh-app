'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      setLoading(false)
      return
    }

    router.push('/crm')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@empresa.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-brand-blue rounded-xl transition-all duration-200 hover:bg-brand-blue-dark active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm shadow-brand-blue/15"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </form>
  )
}
