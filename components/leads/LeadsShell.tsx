'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { LeadRow, LeadOrigen, LeadEstado } from '@/types'
import { crearLead, actualizarLeadEstado, eliminarLead } from '@/app/(protected)/leads/actions'

const ORIGEN_LABELS: Record<LeadOrigen, string> = {
  sitio_web: 'Sitio Web',
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  linkedin_ads: 'LinkedIn Ads',
  otro: 'Otro',
}

const ORIGEN_COLORS: Record<LeadOrigen, string> = {
  meta_ads: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
  google_ads: 'bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/20',
  linkedin_ads: 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20',
  sitio_web: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  otro: 'bg-gray-100 text-gray-600 border-gray-200',
}

const ESTADO_LABELS: Record<LeadEstado, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_negociacion: 'En negociación',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

const ESTADO_COLORS: Record<LeadEstado, string> = {
  nuevo: 'bg-blue-50 text-blue-700 border-blue-200',
  contactado: 'bg-amber-50 text-amber-700 border-amber-200',
  en_negociacion: 'bg-purple-50 text-purple-700 border-purple-200',
  ganado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  perdido: 'bg-red-50 text-red-700 border-red-200',
}

const inputClass = 'w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-800 rounded-xl outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 dark:placeholder-slate-500 disabled:bg-gray-50 dark:disabled:bg-slate-950/40 bg-white dark:bg-slate-900 transition-all font-sans text-gray-900 dark:text-slate-100'
const labelClass = 'block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5'

export function LeadsShell({ leads }: { leads: LeadRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterOrigen, setFilterOrigen] = useState<string>('todos')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()

  // Handler para cambiar de estado al instante
  function handleEstadoChange(leadId: string, nuevoEstado: LeadEstado) {
    startTransition(async () => {
      const res = await actualizarLeadEstado(leadId, nuevoEstado)
      if (res.error) {
        alert('Error al actualizar el estado: ' + res.error)
      } else {
        router.refresh()
      }
    })
  }

  // Handler para eliminar un lead
  function handleEliminar(leadId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente este lead de la base de datos?')) {
      startTransition(async () => {
        const res = await eliminarLead(leadId)
        if (res.error) {
          alert('Error al eliminar: ' + res.error)
        } else {
          router.refresh()
        }
      })
    }
  }

  // Handler para crear lead manual
  function handleCrearLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const res = await crearLead(fd)
      if (res.error) {
        setFormError(res.error)
      } else {
        setModalOpen(false)
        router.refresh()
      }
    })
  }

  // Filtrado de leads
  const query = search.toLowerCase()
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      `${lead.nombre} ${lead.apellido}`.toLowerCase().includes(query) ||
      lead.empresa_razon_social.toLowerCase().includes(query) ||
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.telefono && lead.telefono.includes(query)) ||
      (lead.sector && lead.sector.toLowerCase().includes(query))
      
    const matchesOrigen = filterOrigen === 'todos' || lead.origen === filterOrigen
    const matchesEstado = filterEstado === 'todos' || lead.estado === filterEstado

    return matchesSearch && matchesOrigen && matchesEstado
  })

  // Métricas del Bento Grid
  const totalLeads = leads.length
  const nuevosLeads = leads.filter(l => l.estado === 'nuevo').length
  const ganadosLeads = leads.filter(l => l.estado === 'ganado').length
  
  // Contar orígenes
  const metaCount = leads.filter(l => l.origen === 'meta_ads').length
  const googleCount = leads.filter(l => l.origen === 'google_ads').length
  const linkedinCount = leads.filter(l => l.origen === 'linkedin_ads').length
  const webCount = leads.filter(l => l.origen === 'sitio_web').length

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full p-4 sm:p-6 font-sans">
      
      {/* Header del Módulo */}
      <div className="shrink-0 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Módulo de Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza y gestiona prospectos procedentes de pautas en Meta, Google, LinkedIn y el Sitio Web.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null)
            setModalOpen(true)
          }}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark active:scale-[0.99] transition-all shadow-md shadow-brand-blue/15 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Registrar Lead
        </button>
      </div>

      {/* Bento Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        
        {/* KPI 1: Total */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Total de Leads</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1.5">{totalLeads}</p>
          <p className="text-xxs text-gray-400 mt-1">Registrados en el sistema</p>
        </div>

        {/* KPI 2: Nuevos sin atender */}
        <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 shadow-2xs">
          <p className="text-xxs font-bold text-blue-500 uppercase tracking-wider">Leads Nuevos</p>
          <p className="text-3xl font-extrabold text-brand-blue mt-1.5">{nuevosLeads}</p>
          <p className="text-xxs text-blue-400 mt-1">Pendientes por contactar</p>
        </div>

        {/* KPI 3: Ganados */}
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 shadow-2xs">
          <p className="text-xxs font-bold text-emerald-600 uppercase tracking-wider">Leads Convertidos</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1.5">{ganadosLeads}</p>
          <p className="text-xxs text-emerald-500 mt-1">Empresas ganadas en embudo</p>
        </div>

        {/* KPI 4: Origen de Campañas */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider mb-2">Canales de Campaña</p>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5">
              <span className="block text-[10px] font-bold text-[#1877F2]">Meta</span>
              <span className="text-xs font-extrabold text-gray-800">{metaCount}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5">
              <span className="block text-[10px] font-bold text-[#EA4335]">Google</span>
              <span className="text-xs font-extrabold text-gray-800">{googleCount}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5">
              <span className="block text-[10px] font-bold text-[#0A66C2]">LkdIn</span>
              <span className="text-xs font-extrabold text-gray-800">{linkedinCount}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5">
              <span className="block text-[10px] font-bold text-brand-blue">Web</span>
              <span className="text-xs font-extrabold text-gray-800">{webCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Controles de Filtros y Búsqueda */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Buscador */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, empresa, teléfono, sector..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-800 rounded-xl outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-shadow"
            />
          </div>
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="filterOrigen" className="sr-only">Origen</label>
            <select
              id="filterOrigen"
              value={filterOrigen}
              onChange={(e) => setFilterOrigen(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-bold border border-gray-300 dark:border-slate-800 rounded-xl outline-none focus:border-brand-blue bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              <option value="todos">Origen: Todos</option>
              <option value="sitio_web">Sitio Web</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="linkedin_ads">LinkedIn Ads</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterEstado" className="sr-only">Estado</label>
            <select
              id="filterEstado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-bold border border-gray-300 dark:border-slate-800 rounded-xl outline-none focus:border-brand-blue bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 cursor-pointer"
            >
              <option value="todos">Estado: Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="en_negociacion">En negociación</option>
              <option value="ganado">Ganado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
        </div>

      </div>

      {/* Listado de Leads */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Listado de prospectos ({filteredLeads.length})
          </h2>
          {isPending && (
            <span className="text-xxs font-bold text-brand-blue animate-pulse">Procesando cambio...</span>
          )}
        </div>

        {filteredLeads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-sm text-gray-400">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p className="font-semibold">No se encontraron leads</p>
            <p className="text-xs text-gray-400 mt-0.5">Verifica los filtros o agrega un nuevo lead desde arriba.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-5 select-none">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prospecto</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Empresa / Sector</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contacto</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Origen</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Embudo CRM</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Nombre y Apellido */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 leading-snug">{lead.nombre} {lead.apellido}</p>
                      <p className="text-xxs text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">
                        Registrado: {new Date(lead.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </td>
                    {/* Empresa y Sector */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 leading-snug">{lead.empresa_razon_social}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{lead.sector ?? 'Sector no especificado'}</p>
                    </td>
                    {/* Teléfono y Correo */}
                    <td className="px-5 py-4">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-xs text-brand-blue font-medium hover:underline block leading-relaxed">{lead.email}</a>
                      ) : (
                        <span className="text-xs text-gray-400 block leading-relaxed">—</span>
                      )}
                      {lead.telefono ? (
                        <a href={`tel:${lead.telefono}`} className="text-xs text-gray-500 font-medium hover:underline block mt-0.5">{lead.telefono}</a>
                      ) : (
                        <span className="text-xs text-gray-400 block mt-0.5">—</span>
                      )}
                    </td>
                    {/* Origen del lead */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-3xs ${ORIGEN_COLORS[lead.origen] || ORIGEN_COLORS.otro}`}>
                        {ORIGEN_LABELS[lead.origen] || lead.origen}
                      </span>
                    </td>
                    {/* Estado del CRM editable */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={lead.estado}
                          disabled={isPending}
                          onChange={(e) => handleEstadoChange(lead.id, e.target.value as LeadEstado)}
                          className={`text-xxs font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-shadow focus:ring-1 focus:ring-brand-blue ${
                            ESTADO_COLORS[lead.estado] || ESTADO_COLORS.nuevo
                          }`}
                        >
                          {Object.entries(ESTADO_LABELS).map(([k, v]) => (
                            <option key={k} value={k} className="bg-white text-gray-700 font-semibold">{v}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    {/* Acciones de eliminación */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleEliminar(lead.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar Lead"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear Lead */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-base font-bold text-gray-900">Registrar Nuevo Prospecto (Lead)</h2>
                <p className="text-xxs text-gray-400 mt-0.5">Captura la información del lead de manera interna</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearLead} className="px-6 py-5 space-y-4 font-sans">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Nombre(s) <span className="text-red-500">*</span></label>
                  <input
                    name="nombre"
                    type="text"
                    required
                    placeholder="Ej. Juan"
                    className={inputClass}
                    disabled={isPending}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelClass}>Apellido(s) <span className="text-red-500">*</span></label>
                  <input
                    name="apellido"
                    type="text"
                    required
                    placeholder="Ej. Pérez"
                    className={inputClass}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Empresa o Razón Social <span className="text-red-500">*</span></label>
                <input
                  name="empresa_razon_social"
                  type="text"
                  required
                  placeholder="Ej. Distribuidora del Norte S.A."
                  className={inputClass}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input
                    name="telefono"
                    type="tel"
                    placeholder="Ej. 81 2332 1719"
                    className={inputClass}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Ej. direccion@empresa.com"
                    className={inputClass}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>Sector / Industria</label>
                  <input
                    name="sector"
                    type="text"
                    placeholder="Ej. Manufactura, TI, Retail..."
                    className={inputClass}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className={labelClass}>Origen del Lead <span className="text-red-500">*</span></label>
                  <select
                    name="origen"
                    required
                    className={inputClass}
                    disabled={isPending}
                  >
                    <option value="" className="text-gray-400 font-semibold">Seleccionar canal</option>
                    <option value="meta_ads" className="text-gray-700 font-semibold">Meta Ads</option>
                    <option value="google_ads" className="text-gray-700 font-semibold">Google Ads</option>
                    <option value="linkedin_ads" className="text-gray-700 font-semibold">LinkedIn Ads</option>
                    <option value="sitio_web" className="text-gray-700 font-semibold">Sitio Web</option>
                    <option value="otro" className="text-gray-700 font-semibold">Otro</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 leading-relaxed shrink-0">
                  {formError}
                </p>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 bg-gray-50/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark active:scale-[0.99] transition-all shadow-sm shadow-brand-blue/15 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPending ? 'Guardando...' : 'Guardar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
