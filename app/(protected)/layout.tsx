import { Sidebar } from '@/components/layout/Sidebar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 w-full flex flex-col h-screen ml-[220px] bg-slate-50">
        {children}
      </main>
    </div>
  )
}
