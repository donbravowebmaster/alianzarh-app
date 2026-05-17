'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EtapaPipeline } from '@/types'

const supabase = createClient()

type PipelineCard = {
  id: string
  candidato_id: string
  vacante_id: string
  nombre: string
  apellido: string
  email: string | null
  vacante_titulo: string
  etapa: EtapaPipeline
}

type VacanteOption = { id: string; titulo: string }

type FormState = {
  nombre: string
  apellido: string
  email: string
  vacante_id: string
  etapa: EtapaPipeline
}

const COLUMNAS: { etapa: EtapaPipeline; label: string; bg: string; dot: string }[] = [
  { etapa: 'prospecto',           label: 'Prospecto',           bg: 'bg-gray-50',    dot: 'bg-gray-400' },
  { etapa: 'entrevista_inicial',  label: 'Entrevista inicial',  bg: 'bg-blue-50',    dot: 'bg-blue-400' },
  { etapa: 'entrevista_cliente',  label: 'Entrevista cliente',  bg: 'bg-indigo-50',  dot: 'bg-indigo-400' },
  { etapa: 'oferta',              label: 'Oferta',              bg: 'bg-amber-50',   dot: 'bg-amber-400' },
  { etapa: 'contratado',          label: 'Contratado',          bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
]

const FORM_INITIAL: FormState = { nombre: '', apellido: '', email: '', vacante_id: '', etapa: 'prospecto' }

export function CRMShell() {
  const [cards, setCards] = useState<PipelineCard[]>([])
  const [vacantes, setVacantes] = useState<VacanteOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_INITIAL)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const [{ data: pipeline }, { data: vacantesData }] = await Promise.all([
      supabase
        .from('candidatos_vacantes')
        .select('id, etapa, candidato_id, vacante_id, candidatos(nombre, apellido, email), vacantes(titulo)')
        .order('created_at', { ascending: true }),
      supabase
        .from('vacantes')
        .select('id, titulo')
        .eq('estado', 'activa')
        .order('titulo'),
    ])

    if (pipeline) {
      setCards(
        pipeline.map((row) => {
          const c = row.candidatos as { nombre: string; apellido: string; email: string | null } | null
          const v = row.vacantes as { titulo: string } | null
          return {
            id: row.id,
            candidato_id: row.candidato_id,
            vacante_id: row.vacante_id,
            nombre: c?.nombre ?? '',
            apellido: c?.apellido ?? '',
            email: c?.email ?? null,
            vacante_titulo: v?.titulo ?? '',
            etapa: row.etapa,
          }
        })
      )
    }

    if (vacantesData) setVacantes(vacantesData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openModal() {
    setForm({ ...FORM_INITIAL, vacante_id: vacantes[0]?.id ?? '' })
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim()) {
      setFormError('Nombre y apellido son obligatorios.')
      return
    }
    if (!form.vacante_id) {
      setFormError('Selecciona una vacante.')
      return
    }
    setSaving(true)
    setFormError(null)

    const { data: candidato, error: errCandidato } = await supabase
      .from('candidatos')
      .insert({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim() || null,
      })
      .select('id')
      .single()

    if (errCandidato || !candidato) {
      setFormError(errCandidato?.message ?? 'Error al crear candidato.')
      setSaving(false)
      return
    }

    const { error: errPipeline } = await supabase
      .from('candidatos_vacantes')
      .insert({ candidato_id: candidato.id, vacante_id: form.vacante_id, etapa: form.etapa })

    if (errPipeline) {
      setFormError(errPipeline.message)
      setSaving(false)
      return
    }

    await fetchData()
    setSaving(false)
    closeModal()
  }

  async function handleEtapaChange(pipelineId: string, nuevaEtapa: EtapaPipeline) {
    setCards((prev) => prev.map((c) => (c.id === pipelineId ? { ...c, etapa: nuevaEtapa } : c)))
    await supabase.from('candidatos_vacantes').update({ etapa: nuevaEtapa }).eq('id', pipelineId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Cargando pipeline…
      </div>
    )
  }

  const query = search.toLowerCase()
  const visibleCards = query
    ? cards.filter(
        (c) =>
          `${c.nombre} ${c.apellido}`.toLowerCase().includes(query) ||
          c.vacante_titulo.toLowerCase().includes(query)
      )
    : cards

  return (
    <>
      {/* Contenedor Maestro */}
      <div className="flex flex-col flex-1 min-h-0 w-full p-4 sm:p-6">

        {/* Header anclado */}
        <div className="w-full shrink-0 mb-6">
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Candidatos</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-[300px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar candidato..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400 bg-white"
                />
              </div>
              <button
                onClick={openModal}
                className="w-full sm:w-auto shrink-0 whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                + Nuevo Candidato
              </button>
            </div>
          </div>
        </div>

        {/* Tablero Kanban: scroll horizontal interno */}
        <div className="flex-1 min-h-0 w-full overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNAS.map(({ etapa, label, bg, dot }) => {
              const col = visibleCards.filter((c) => c.etapa === etapa)
              return (
                <div key={etapa} className="w-64 flex flex-col">
                  <div className="flex items-center gap-2 mb-2.5 px-0.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider truncate">
                      {label}
                    </span>
                    <span className="ml-auto text-[11px] font-medium text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
                      {col.length}
                    </span>
                  </div>
                  <div className={`flex-1 rounded-xl border border-gray-200/70 ${bg} p-2 space-y-2 overflow-y-auto`}>
                    {col.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 shadow-sm"
                      >
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {c.nombre} {c.apellido}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{c.vacante_titulo}</p>
                        <select
                          value={c.etapa}
                          onChange={(e) => handleEtapaChange(c.id, e.target.value as EtapaPipeline)}
                          className="mt-2 w-full text-[11px] border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-600 focus:outline-none focus:border-gray-400"
                        >
                          {COLUMNAS.map((col) => (
                            <option key={col.etapa} value={col.etapa}>{col.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {col.length === 0 && (
                      <div className="flex items-center justify-center h-20">
                        <p className="text-xs text-gray-400">Sin candidatos</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Nuevo candidato</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-0.5 rounded">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    autoFocus
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="María"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))}
                    placeholder="García"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="(Opcional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Vacante</label>
                {vacantes.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    No hay vacantes activas. Crea una vacante primero.
                  </p>
                ) : (
                  <select
                    value={form.vacante_id}
                    onChange={(e) => setForm((p) => ({ ...p, vacante_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white"
                  >
                    {vacantes.map((v) => (
                      <option key={v.id} value={v.id}>{v.titulo}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Etapa inicial</label>
                <select
                  value={form.etapa}
                  onChange={(e) => setForm((p) => ({ ...p, etapa: e.target.value as EtapaPipeline }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white"
                >
                  {COLUMNAS.map((c) => (
                    <option key={c.etapa} value={c.etapa}>{c.label}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || vacantes.length === 0}
                  className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar candidato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
