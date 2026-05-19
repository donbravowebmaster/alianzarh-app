import { createClient } from '@/lib/supabase/server'
import { ClientesShell } from '@/components/clientes/ClientesShell'
import type { EmpresaRow, VacanteRow } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Clientes y Vacantes — AlianzaRH' }

export type VacanteConEmpresa = VacanteRow & {
  empresas: { nombre: string } | null
}

export default async function ClientesPage() {
  const supabase = await createClient()

  const [{ data: empresas }, { data: vacantes }] = await Promise.all([
    supabase.from('empresas').select('*').order('nombre'),
    supabase
      .from('vacantes')
      .select('*, empresas(nombre)')
      .order('created_at', { ascending: false }),
  ])

  return (
    <ClientesShell
      empresas={(empresas as EmpresaRow[]) ?? []}
      vacantes={(vacantes as unknown as VacanteConEmpresa[]) ?? []}
    />
  )
}
