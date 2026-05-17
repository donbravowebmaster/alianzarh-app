'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function crearEmpresa(formData: FormData): Promise<{ error: string | null }> {
  const nombre = (formData.get('nombre') as string)?.trim()
  if (!nombre) return { error: 'El nombre de la empresa es requerido.' }

  const supabase = await createClient()
  const { error } = await supabase.from('empresas').insert({
    nombre,
    industria: (formData.get('industria') as string)?.trim() || null,
    contacto_nombre: (formData.get('contacto_nombre') as string)?.trim() || null,
    contacto_email: (formData.get('contacto_email') as string)?.trim() || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return { error: null }
}

export async function crearVacante(formData: FormData): Promise<{ error: string | null }> {
  const empresa_id = (formData.get('empresa_id') as string)?.trim()
  const titulo = (formData.get('titulo') as string)?.trim()

  if (!empresa_id) return { error: 'Selecciona una empresa.' }
  if (!titulo) return { error: 'El título de la vacante es requerido.' }

  const sueldoMin = (formData.get('sueldo_minimo') as string)?.trim()
  const sueldoMax = (formData.get('sueldo_maximo') as string)?.trim()

  const supabase = await createClient()
  const { error } = await supabase.from('vacantes').insert({
    empresa_id,
    titulo,
    sueldo_minimo: sueldoMin ? parseFloat(sueldoMin) : null,
    sueldo_maximo: sueldoMax ? parseFloat(sueldoMax) : null,
    estado: 'activa',
  })

  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return { error: null }
}
