'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearEmpresa, crearVacante } from '@/app/(protected)/clientes/actions'
import type { EmpresaRow, VacanteRow } from '@/types'

type VacanteConEmpresa = VacanteRow & { empresas: { nombre: string } | null }

const ESTADO_COLORS: Record<string, string> = {
  activa:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  pausada:   'bg-amber-50 text-amber-700 border-amber-200',
  cerrada:   'bg-gray-100 text-gray-600 border-gray-200',
  cancelada: 'bg-red-50 text-red-700 border-red-200',
}

const input = 'w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 disabled:bg-gray-50 bg-white transition-shadow'
const label = 'block text-xs font-semibold text-gray-700 mb-1.5'

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function formatSueldo(min: number | null, max: number | null) {
  if (min && max) return `${formatMXN(min)} – ${formatMXN(max)}`
  if (min) return `Desde ${formatMXN(min)}`
  if (max) return `Hasta ${formatMXN(max)}`
  return '—'
}

type Tab = 'empresas' | 'vacantes'

export function ClientesShell({
  empresas,
  vacantes,
}: {
  empresas: EmpresaRow[]
  vacantes: VacanteConEmpresa[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('empresas')

  // Empresa form
  const [empresaKey, setEmpresaKey] = useState(0)
  const [empresaError, setEmpresaError] = useState<string | null>(null)
  const [pendingEmpresa, startEmpresa] = useTransition()

  // Vacante form
  const [vacanteKey, setVacanteKey] = useState(0)
  const [vacanteError, setVacanteError] = useState<string | null>(null)
  const [pendingVacante, startVacante] = useTransition()

  function handleEmpresa(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmpresaError(null)
    const fd = new FormData(e.currentTarget)
    startEmpresa(async () => {
      const res = await crearEmpresa(fd)
      if (res.error) setEmpresaError(res.error)
      else { setEmpresaKey(k => k + 1); router.refresh() }
    })
  }

  function handleVacante(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setVacanteError(null)
    const fd = new FormData(e.currentTarget)
    startVacante(async () => {
      const res = await crearVacante(fd)
      if (res.error) setVacanteError(res.error)
      else { setVacanteKey(k => k + 1); router.refresh() }
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full p-4 sm:p-6">

      {/* Header */}
      <div className="shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clientes y Vacantes</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona empresas clientes y sus posiciones abiertas.</p>
      </div>

      {/* Tabs */}
      <div className="shrink-0 border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {(['empresas', 'vacantes'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-bold transition-all ${
                tab === t
                  ? 'border-b-2 border-brand-blue text-brand-blue'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {t === 'empresas'
                ? `Empresas (${empresas.length})`
                : `Vacantes (${vacantes.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Empresas */}
      {tab === 'empresas' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 max-w-5xl">

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Nueva empresa</h2>
            <form key={empresaKey} onSubmit={handleEmpresa} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Nombre <span className="text-red-500">*</span></label>
                  <input name="nombre" type="text" required placeholder="Grupo Empresarial SA" className={input} disabled={pendingEmpresa} />
                </div>
                <div>
                  <label className={label}>Industria</label>
                  <input name="industria" type="text" placeholder="Tecnología, Retail, Finanzas..." className={input} disabled={pendingEmpresa} />
                </div>
                <div>
                  <label className={label}>Contacto</label>
                  <input name="contacto_nombre" type="text" placeholder="Nombre del contacto" className={input} disabled={pendingEmpresa} />
                </div>
                <div>
                  <label className={label}>Email de contacto</label>
                  <input name="contacto_email" type="email" placeholder="contacto@empresa.com" className={input} disabled={pendingEmpresa} />
                </div>
              </div>
              {empresaError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{empresaError}</p>
              )}
              <button
                type="submit"
                disabled={pendingEmpresa}
                className="px-4 py-2.5 text-sm font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark active:scale-[0.99] disabled:opacity-50 transition-all shadow-sm shadow-brand-blue/15 cursor-pointer"
              >
                {pendingEmpresa ? 'Guardando...' : '+ Agregar empresa'}
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Empresas registradas</h2>
            </div>
            {empresas.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                Aún no hay empresas. Agrega la primera arriba.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Empresa', 'Industria', 'Contacto', 'Email'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {empresas.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{e.nombre}</td>
                        <td className="px-6 py-4 text-gray-500">{e.industria ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-500">{e.contacto_nombre ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-500">{e.contacto_email ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: Vacantes */}
      {tab === 'vacantes' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 max-w-5xl">

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Nueva vacante</h2>
            {empresas.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Primero registra al menos una empresa en la pestaña <strong>Empresas</strong>.
              </p>
            ) : (
              <form key={vacanteKey} onSubmit={handleVacante} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Empresa <span className="text-red-500">*</span></label>
                    <select name="empresa_id" required className={input} disabled={pendingVacante}>
                      <option value="">Selecciona una empresa</option>
                      {empresas.map((e) => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Título <span className="text-red-500">*</span></label>
                    <input name="titulo" type="text" required placeholder="Ej. Gerente de Finanzas" className={input} disabled={pendingVacante} />
                  </div>
                  <div>
                    <label className={label}>Sueldo mínimo (MXN)</label>
                    <input name="sueldo_minimo" type="number" min="0" step="500" placeholder="0" className={input} disabled={pendingVacante} />
                  </div>
                  <div>
                    <label className={label}>Sueldo máximo (MXN)</label>
                    <input name="sueldo_maximo" type="number" min="0" step="500" placeholder="0" className={input} disabled={pendingVacante} />
                  </div>
                </div>
                {vacanteError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{vacanteError}</p>
                )}
                <button
                  type="submit"
                  disabled={pendingVacante}
                  className="px-4 py-2.5 text-sm font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark active:scale-[0.99] disabled:opacity-50 transition-all shadow-sm shadow-brand-blue/15 cursor-pointer"
                >
                  {pendingVacante ? 'Guardando...' : '+ Agregar vacante'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Vacantes registradas</h2>
            </div>
            {vacantes.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                Aún no hay vacantes. Agrega la primera arriba.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Título', 'Empresa', 'Sueldo', 'Estado'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vacantes.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{v.titulo}</td>
                        <td className="px-6 py-4 text-gray-500">{v.empresas?.nombre ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-500">{formatSueldo(v.sueldo_minimo, v.sueldo_maximo)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ESTADO_COLORS[v.estado] ?? ESTADO_COLORS.cerrada}`}>
                            {v.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
