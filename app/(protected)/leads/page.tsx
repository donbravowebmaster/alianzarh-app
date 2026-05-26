import { createClient } from '@/lib/supabase/server'
import { LeadsShell } from '@/components/leads/LeadsShell'
import type { LeadRow } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nuevos Leads — AlianzaRH' }

export default async function LeadsPage() {
  const supabase = (await createClient()) as any

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <LeadsShell leads={(leads as unknown as LeadRow[]) ?? []} />
  )
}
