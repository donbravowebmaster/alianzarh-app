'use client'

import { useState, useTransition } from 'react'
import type { CotizadorResult } from '@/types'
import { calcularAction } from '@/app/(app)/(protected)/cotizador/actions'

const NIVEL_COLORS: Record<string, string> = {
  'Operativo / Administrativo': 'bg-gray-50 text-gray-700 border-gray-200',
  'Especializado':              'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Jefatura / Senior':          'bg-amber-50 text-amber-700 border-amber-200',
  'Gerencial / Directivo':      'bg-purple-50 text-purple-700 border-purple-200',
  'Ingeniería / TI':            'bg-blue-50 text-blue-700 border-blue-200',
}

function formatMXN(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
}

export function CotizadorForm() {
  const [puesto, setPuesto] = useState('')
  const [sueldo, setSueldo] = useState('')
  const [result, setResult] = useState<CotizadorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const sueldoNum = parseFloat(sueldo.replace(/,/g, ''))
    if (!puesto.trim() || isNaN(sueldoNum) || sueldoNum <= 0) {
      setError('Ingresa un puesto válido y un sueldo mayor a cero.')
      return
    }

    startTransition(async () => {
      const res = await calcularAction({ puesto: puesto.trim(), sueldo: sueldoNum })
      setResult(res)
    })
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setPuesto('')
    setSueldo('')
  }

  const nivelColor = result ? NIVEL_COLORS[result.nivel] ?? NIVEL_COLORS.Operativo : ''

  return (
    <div className="max-w-lg">
      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="puesto" className="block text-xs font-medium text-gray-700 mb-1.5">
              Puesto
            </label>
            <input
              id="puesto"
              type="text"
              value={puesto}
              onChange={(e) => setPuesto(e.target.value)}
              placeholder="Ej. Gerente de Finanzas"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400 disabled:bg-gray-50"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="sueldo" className="block text-xs font-medium text-gray-700 mb-1.5">
              Sueldo mensual bruto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                id="sueldo"
                type="text"
                inputMode="numeric"
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400 disabled:bg-gray-50"
                disabled={isPending}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Calculando...' : 'Calcular cotización'}
          </button>
        </form>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Cotización para</p>
              <h3 className="text-sm font-semibold text-gray-900">{result.puesto}</h3>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${nivelColor}`}>
              {result.nivel}
            </span>
          </div>

          {/* Precio sugerido — protagonista */}
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Fee de búsqueda sugerido</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatMXN(result.precio)}</p>
            <div className="mt-2">
              <span className="inline-block text-sm text-emerald-700 bg-emerald-50 rounded-md px-2 py-1">
                Utilidad esperada: {formatMXN(result.utilidad)} ({result.margenUtilidad}%)
              </span>
            </div>
          </div>

          {/* Datos secundarios */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <ResultCell label="Sueldo mensual" value={formatMXN(result.sueldo)} />
            <ResultCell label="Garantía" value={`${result.garantia} días`} />
          </div>

          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Nueva cotización
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultCell({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-base font-semibold ${highlight ? 'text-gray-900' : 'text-gray-700'}`}>{value}</p>
    </div>
  )
}
