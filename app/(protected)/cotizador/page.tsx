import { CotizadorForm } from '@/components/cotizador/CotizadorForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cotizador — RRHH Intranet' }

export default function CotizadorPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <div className="mb-7">
        <h1 className="text-lg font-semibold text-gray-900">Cotizador de búsqueda</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ingresa el puesto y el sueldo mensual bruto para generar una cotización.
        </p>
      </div>
      <CotizadorForm />
    </div>
  )
}
