'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { LeadOrigen, LeadEstado } from '@/types'

export async function crearLead(formData: FormData): Promise<{ error: string | null }> {
  const nombre = (formData.get('nombre') as string)?.trim()
  const apellido = (formData.get('apellido') as string)?.trim()
  const empresa_razon_social = (formData.get('empresa_razon_social') as string)?.trim()
  const origen = (formData.get('origen') as string)?.trim() as LeadOrigen

  if (!nombre || !apellido) return { error: 'Nombre y Apellido son requeridos.' }
  if (!empresa_razon_social) return { error: 'El nombre de la empresa / razón social es requerido.' }
  if (!origen) return { error: 'El origen del lead es requerido.' }

  const telefono = (formData.get('telefono') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const sector = (formData.get('sector') as string)?.trim() || null

  const supabase = (await createClient()) as any
  const { error } = await supabase.from('leads').insert({
    nombre,
    apellido,
    empresa_razon_social,
    telefono,
    email,
    sector,
    origen,
    estado: 'nuevo'
  })

  if (error) return { error: error.message }
  revalidatePath('/leads')
  return { error: null }
}

export async function actualizarLeadEstado(id: string, nuevoEstado: LeadEstado): Promise<{ error: string | null }> {
  if (!id || !nuevoEstado) return { error: 'Datos incompletos.' }

  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from('leads')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/leads')
  return { error: null }
}

export async function eliminarLead(id: string): Promise<{ error: string | null }> {
  if (!id) return { error: 'ID de lead no válido.' }

  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/leads')
  return { error: null }
}
