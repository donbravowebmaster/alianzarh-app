import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 w-full flex flex-col h-screen ml-[var(--sidebar-width,220px)] transition-all duration-300 ease-in-out bg-slate-50 dark:bg-[#070a13]">
        {children}
      </main>
    </div>
  )
}
