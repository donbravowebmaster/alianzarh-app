import type { CotizadorInput, CotizadorResult, NivelPuesto } from '@/types'

const COSTO_OPERATIVO_MENSUAL = 30_950
const CAPACIDAD_VACANTES_MES = 8
const COSTO_BASE = COSTO_OPERATIVO_MENSUAL / CAPACIDAD_VACANTES_MES  // 3,868.75
const MARGEN = 0.30

const KEYWORDS_TI = [
  'ing', 'ingeniero', 'ingenieria', 'desarrollador', 'developer',
  'sistemas', 'it', 'datos',
]

const NIVELES: Array<{
  nivel: NivelPuesto
  umbralMax: number
  factor: number
  garantiaDias: number
}> = [
  { nivel: 'Operativo / Administrativo', umbralMax: 15_000,   factor: 1, garantiaDias: 15 },
  { nivel: 'Especializado',              umbralMax: 35_000,   factor: 2, garantiaDias: 30 },
  { nivel: 'Jefatura / Senior',          umbralMax: 50_000,   factor: 3, garantiaDias: 45 },
  { nivel: 'Gerencial / Directivo',      umbralMax: Infinity, factor: 4, garantiaDias: 60 },
]

function esTI(puesto: string): boolean {
  const normalizado = puesto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return KEYWORDS_TI.some((kw) => new RegExp(`\\b${kw}\\b`).test(normalizado))
}

export function calcularCotizacion(input: CotizadorInput): CotizadorResult {
  const { puesto, sueldo } = input
  const match = NIVELES.find((n) => sueldo <= n.umbralMax)!
  const tiDetected = esTI(puesto)
  const nivel: NivelPuesto = tiDetected ? 'Ingeniería / TI' : match.nivel

  const costoPuesto = COSTO_BASE * match.factor
  const precio = Math.round(costoPuesto / (1 - MARGEN))
  const utilidad = Math.round(precio - costoPuesto)
  const margenUtilidad = Math.round(MARGEN * 100)

  return {
    puesto,
    sueldo,
    nivel,
    factor: match.factor,
    garantia: match.garantiaDias,
    precio,
    utilidad,
    margenUtilidad,
    costoBase: Math.round(COSTO_BASE),
    costoPuesto: Math.round(costoPuesto),
    margen: MARGEN,
    esTI: tiDetected,
  }
}
