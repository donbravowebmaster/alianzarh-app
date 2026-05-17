'use server'

import { calcularCotizacion } from '@/lib/cotizador/calculator'
import type { CotizadorInput, CotizadorResult } from '@/types'

export async function calcularAction(input: CotizadorInput): Promise<CotizadorResult> {
  if (!input.puesto || input.sueldo <= 0) {
    throw new Error('Datos de entrada inválidos')
  }
  return calcularCotizacion(input)
}
