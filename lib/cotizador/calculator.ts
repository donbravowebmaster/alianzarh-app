import type { CotizadorInput, CotizadorResult, NivelPuesto, CotizadorConfig } from '@/types'

export const DEFAULT_COTIZADOR_CONFIG: CotizadorConfig = {
  costoOperativoMensual: 30_950,
  capacidadVacantesMes: 8,
  margen: 0.30,
  niveles: [
    { nivel: 'Operativo / Administrativo', umbralMax: 15_000,   factor: 1, garantiaDias: 15 },
    { nivel: 'Especializado',              umbralMax: 35_000,   factor: 2, garantiaDias: 30 },
    { nivel: 'Jefatura / Senior',          umbralMax: 50_000,   factor: 3, garantiaDias: 45 },
    { nivel: 'Gerencial / Directivo',      umbralMax: 999_999_999, factor: 4, garantiaDias: 60 },
  ],
  keywordsTI: [
    'ing', 'ingeniero', 'ingenieria', 'desarrollador', 'developer',
    'sistemas', 'it', 'datos',
  ]
}

export function calcularCotizacion(
  input: CotizadorInput,
  config: CotizadorConfig = DEFAULT_COTIZADOR_CONFIG
): CotizadorResult {
  const { puesto, sueldo } = input
  const { costoOperativoMensual, capacidadVacantesMes, margen, niveles, keywordsTI } = config

  const costoBase = costoOperativoMensual / capacidadVacantesMes

  // Función de detección de TI
  const normalizado = puesto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const tiDetected = keywordsTI.some((kw) => {
    if (!kw.trim()) return false
    // Escapar caracteres regex especiales para seguridad
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escapedKw}\\b`).test(normalizado)
  })

  // Buscar el nivel que corresponde según el sueldo, o por defecto el último nivel
  const match = niveles.find((n) => sueldo <= n.umbralMax) || niveles[niveles.length - 1]
  const nivel: NivelPuesto = tiDetected ? 'Ingeniería / TI' : match.nivel

  const costoPuesto = costoBase * match.factor
  const precio = Math.round(costoPuesto / (1 - margen))
  const utilidad = Math.round(precio - costoPuesto)
  const margenUtilidad = Math.round(margen * 100)

  return {
    puesto,
    sueldo,
    nivel,
    factor: match.factor,
    garantia: match.garantiaDias,
    precio,
    utilidad,
    margenUtilidad,
    costoBase: Math.round(costoBase),
    costoPuesto: Math.round(costoPuesto),
    margen,
    esTI: tiDetected,
  }
}
