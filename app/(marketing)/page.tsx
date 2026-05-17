export default function MarketingHome() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-8 py-5 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 tracking-tight">AlianzaRH</span>
          <a
            href="https://app.alianzarh.com/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Acceder →
          </a>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Conectamos talento con oportunidades
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Soluciones de reclutamiento especializadas para empresas en crecimiento.
          </p>
        </div>
      </section>
    </main>
  )
}
