'use client'

import { useState, useEffect, useTransition } from 'react'
import type { CotizadorResult, CotizadorConfig, NivelPuesto } from '@/types'
import { calcularCotizacion, DEFAULT_COTIZADOR_CONFIG } from '@/lib/cotizador/calculator'

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

  // Configuración del Cotizador
  const [config, setConfig] = useState<CotizadorConfig>(DEFAULT_COTIZADOR_CONFIG)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'financiero' | 'complejidad' | 'keywords'>('financiero')

  // Cargar configuración de localStorage en el cliente
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('cotizador_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Asegurarse de que conserve todas las propiedades básicas
        if (parsed.costoOperativoMensual && parsed.capacidadVacantesMes && parsed.niveles) {
          setConfig(parsed)
        }
      } catch (e) {
        console.error('Error al parsear cotizador_config de localStorage', e)
      }
    }
  }, [])

  // Guardar configuración en localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cotizador_config', JSON.stringify(config))
    }
  }, [config, isMounted])

  // Recalcular la cotización activa en tiempo real cuando cambie la configuración
  useEffect(() => {
    if (result) {
      const sueldoNum = parseFloat(sueldo.replace(/[^0-9.]/g, '')) || 0
      if (puesto.trim() && sueldoNum > 0) {
        const res = calcularCotizacion({ puesto: puesto.trim(), sueldo: sueldoNum }, config)
        setResult(res)
      }
    }
  }, [config])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const sueldoNum = parseFloat(sueldo.replace(/,/g, ''))
    if (!puesto.trim() || isNaN(sueldoNum) || sueldoNum <= 0) {
      setError('Ingresa un puesto válido y un sueldo mayor a cero.')
      return
    }

    startTransition(async () => {
      // Calcular localmente para respuesta instantánea y soporte de variables editadas
      const res = calcularCotizacion({ puesto: puesto.trim(), sueldo: sueldoNum }, config)
      setResult(res)
    })
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setPuesto('')
    setSueldo('')
  }

  function handleResetConfig() {
    if (confirm('¿Estás seguro de restablecer todos los parámetros del cotizador a sus valores predeterminados?')) {
      setConfig(DEFAULT_COTIZADOR_CONFIG)
      localStorage.removeItem('cotizador_config')
    }
  }

  const handleConfigChange = (key: keyof CotizadorConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleNivelChange = (index: number, field: 'factor' | 'garantiaDias' | 'umbralMax', value: number) => {
    setConfig((prev) => {
      const nuevosNiveles = [...prev.niveles]
      nuevosNiveles[index] = {
        ...nuevosNiveles[index],
        [field]: value,
      }
      return {
        ...prev,
        niveles: nuevosNiveles,
      }
    })
  }

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map((k) => k.trim())
    handleConfigChange('keywordsTI', keywords)
  }

  const nivelColor = result ? NIVEL_COLORS[result.nivel] ?? NIVEL_COLORS.Operativo : ''

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Columna Izquierda: Cotizador y Resultados */}
      <div className="lg:col-span-7 space-y-6">
        {!result ? (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5 transition-all">
            <h2 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">
              Generar Nueva Cotización
            </h2>
            
            <div>
              <label htmlFor="puesto" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Puesto o Vacante
              </label>
              <input
                id="puesto"
                type="text"
                value={puesto}
                onChange={(e) => setPuesto(e.target.value)}
                placeholder="Ej. Desarrollador Fullstack, Director de Operaciones"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 disabled:bg-gray-50 transition-shadow"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="sueldo" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Sueldo mensual bruto sugerido
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  id="sueldo"
                  type="text"
                  inputMode="numeric"
                  value={sueldo}
                  onChange={(e) => setSueldo(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder="0"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 disabled:bg-gray-50 transition-shadow"
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-dark active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm shadow-brand-blue/15"
            >
              {isPending ? 'Calculando...' : 'Calcular cotización'}
            </button>
          </form>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cotización para</p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{result.puesto}</h3>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border shadow-2xs ${nivelColor}`}>
                {result.nivel}
              </span>
            </div>

            {/* Precio sugerido — protagonista */}
            <div className="px-6 py-6 border-b border-gray-100 bg-linear-to-b from-transparent to-gray-50/50">
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Fee de búsqueda sugerido</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{formatMXN(result.precio)}</span>
                <span className="text-xs text-gray-500 font-medium">MXN + IVA</span>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Utilidad esperada: {formatMXN(result.utilidad)} ({result.margenUtilidad}%)
                </span>
              </div>
            </div>

            {/* Datos secundarios */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 bg-white">
              <ResultCell label="Sueldo Mensual Bruto" value={formatMXN(result.sueldo)} />
              <ResultCell label="Garantía de Reemplazo" value={`${result.garantia} días`} />
            </div>

            {/* Desglose del cálculo */}
            <details className="border-t border-gray-100" open>
              <summary className="px-6 py-4 cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 select-none bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                <span>📊 Desglose Técnico del Cálculo (Reactivo)</span>
                <span className="text-gray-400 text-xxs font-normal">Clic para colapsar</span>
              </summary>
              <div className="px-6 py-5 bg-white space-y-4 text-xs">
                {/* Paso 1: Detección de TI */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-800">Análisis y Clasificación del Puesto</p>
                    <p className="text-gray-500">
                      {result.esTI
                        ? `✓ Puesto detectado como TI (coincidencia con keywords) → Nivel: ${result.nivel}`
                        : `○ Puesto general → Clasificado en Nivel: ${result.nivel}`}
                    </p>
                  </div>
                </div>

                {/* Paso 2: Costo base */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-800">Costo Operativo Unitario</p>
                    <p className="text-gray-500">
                      {formatMXN(config.costoOperativoMensual)} (Costo Op.) ÷ {config.capacidadVacantesMes} vacantes/mes = <strong className="text-gray-700">{formatMXN(result.costoBase)}</strong> por puesto.
                    </p>
                  </div>
                </div>

                {/* Paso 3: Factor por nivel */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-800">Factor de Complejidad por Nivel</p>
                    <p className="text-gray-500">
                      El nivel <strong>"{result.nivel}"</strong> aplica un multiplicador de complejidad de <strong className="text-gray-700">{result.factor}x</strong>.
                    </p>
                  </div>
                </div>

                {/* Paso 4: Costo del puesto */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">4</div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-800">Costo Específico de Búsqueda</p>
                    <p className="text-gray-500">
                      {formatMXN(result.costoBase)} × {result.factor} = <strong className="text-gray-700">{formatMXN(result.costoPuesto)}</strong>.
                    </p>
                  </div>
                </div>

                {/* Paso 5: Margen y precio final */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold shrink-0">5</div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-800">Precio Sugerido de Venta</p>
                    <p className="text-gray-500">
                      Margen del <strong>{Math.round(config.margen * 100)}%</strong> deseado: {formatMXN(result.costoPuesto)} ÷ (1 − {config.margen}) = <strong className="text-gray-900 font-bold">{formatMXN(result.precio)}</strong>.
                    </p>
                  </div>
                </div>

                {/* Resumen de márgenes */}
                <div className="pt-4 border-t border-gray-100 space-y-2.5">
                  <p className="font-bold text-gray-900 text-xs">💰 Resumen Financiero de la Vacante</p>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <div className="text-gray-500">Costo operativo interno:</div>
                    <div className="font-semibold text-gray-800 text-right">{formatMXN(result.costoPuesto)}</div>
                    
                    <div className="text-gray-500">Precio facturado al cliente:</div>
                    <div className="font-bold text-gray-900 text-right">{formatMXN(result.precio)}</div>
                    
                    <div className="text-emerald-700 font-semibold border-t border-gray-200/60 pt-2 mt-1">Margen de ganancia ({result.margenUtilidad}%):</div>
                    <div className="font-bold text-emerald-600 text-right border-t border-gray-200/60 pt-2 mt-1">{formatMXN(result.utilidad)}</div>
                  </div>
                </div>
              </div>
            </details>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
              >
                <span>←</span> Nueva cotización
              </button>
              <p className="text-xxs text-gray-400 italic">Los cambios en los parámetros del panel derecho se reflejan al instante.</p>
            </div>
          </div>
        )}
      </div>

      {/* Columna Derecha: Configuración de Parámetros Editables */}
      <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Variables de Cotización</h3>
            <p className="text-xxs text-gray-500 mt-0.5">Personaliza fórmulas y valores al instante</p>
          </div>
          <button
            onClick={handleResetConfig}
            className="text-[10px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md border border-red-100 transition-colors cursor-pointer"
            title="Restaurar valores de fábrica"
          >
            Restablecer
          </button>
        </div>

        {/* Tabs de Configuración */}
        <div className="flex border-b border-gray-100 bg-gray-50/30">
          <button
            onClick={() => setActiveTab('financiero')}
            className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'financiero'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📊 Financiero
          </button>
          <button
            onClick={() => setActiveTab('complejidad')}
            className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'complejidad'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            ⚡ Niveles
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'keywords'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            💻 Palabras TI
          </button>
        </div>

        {/* Contenido de Configuración */}
        <div className="p-5 space-y-4">
          
          {/* TAB 1: FINANCIERO */}
          {activeTab === 'financiero' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 text-[11px] text-blue-800 leading-relaxed">
                Afecta directamente el costo operativo unitario y el margen de ganancia aplicados sobre cada búsqueda.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Costo Operativo Mensual (MXN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    value={config.costoOperativoMensual}
                    onChange={(e) => handleConfigChange('costoOperativoMensual', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-6 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-medium"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Costo total de operación mensual de la agencia de reclutamiento.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capacidad de Vacantes / Mes
                </label>
                <input
                  type="number"
                  value={config.capacidadVacantesMes}
                  onChange={(e) => handleConfigChange('capacidadVacantesMes', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-medium"
                />
                <p className="text-[10px] text-gray-400 mt-1">Número de vacantes promedio que el equipo puede cerrar mensualmente.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Margen de Utilidad
                  </label>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {Math.round(config.margen * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.80"
                  step="0.01"
                  value={config.margen}
                  onChange={(e) => handleConfigChange('margen', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                  <span>5%</span>
                  <span>Margen objetivo sugerido</span>
                  <span>80%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Costo Operativo Unitario Base:</span>
                <span className="font-bold text-gray-900">{formatMXN(config.costoOperativoMensual / config.capacidadVacantesMes)}</span>
              </div>
            </div>
          )}

          {/* TAB 2: NIVELES */}
          {activeTab === 'complejidad' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">
                Modifica el multiplicador de dificultad, los días de garantía y los límites de sueldo para clasificar vacantes.
              </div>

              <div className="space-y-4 divide-y divide-gray-100">
                {config.niveles.map((n, idx) => (
                  <div key={n.nivel} className={`pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        {n.nivel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Factor</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={n.factor}
                          onChange={(e) => handleNivelChange(idx, 'factor', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md outline-none focus:border-brand-blue font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Garantía (días)</label>
                        <input
                          type="number"
                          min="0"
                          value={n.garantiaDias}
                          onChange={(e) => handleNivelChange(idx, 'garantiaDias', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md outline-none focus:border-brand-blue font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Sueldo Máx ($)</label>
                        <input
                          type="number"
                          min="1"
                          value={n.umbralMax === 999_999_999 ? '' : n.umbralMax}
                          placeholder={n.umbralMax === 999_999_999 ? '∞ Sin Límite' : ''}
                          onChange={(e) => handleNivelChange(idx, 'umbralMax', e.target.value === '' ? 999_999_999 : parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md outline-none focus:border-brand-blue font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PALABRAS CLAVE TI */}
          {activeTab === 'keywords' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 text-[11px] text-blue-800 leading-relaxed">
                Si el puesto contiene alguna de estas palabras, se clasificará automáticamente en el nivel <strong>"Ingeniería / TI"</strong>, ignorando la tabulación por sueldos.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Lista de palabras clave (separadas por comas)
                </label>
                <textarea
                  rows={4}
                  value={config.keywordsTI.join(', ')}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  placeholder="Ej. ing, ingeniero, desarrollador, developer, it"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Tip: Escribe las palabras en minúsculas y sin acentos. La búsqueda no distingue entre mayúsculas y minúsculas.
                </p>
              </div>

              {/* Tag preview */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Palabras Clave Activas ({config.keywordsTI.filter(Boolean).length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto border border-gray-100 rounded-xl p-2.5 bg-gray-50/40">
                  {config.keywordsTI.filter(Boolean).map((kw, i) => (
                    <span
                      key={`${kw}-${i}`}
                      className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 shadow-3xs"
                    >
                      {kw}
                    </span>
                  ))}
                  {config.keywordsTI.filter(Boolean).length === 0 && (
                    <span className="text-xxs text-gray-400 italic">No hay palabras clave activas.</span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function ResultCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xxs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  )
}
