import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex bg-[#f8fafc] font-sans relative overflow-hidden">
      {/* Injected custom animations for floating effects and glowing blobs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}} />

      {/* Background colorful glowing blobs (visible behind cards) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#357ee3]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c379d8]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />

      {/* Left Panel: Immersive Brand Presentation (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] bg-[#0d1117] relative flex-col justify-between p-16 overflow-hidden border-r border-slate-800">
        {/* Abstract background grid or subtle lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        
        {/* Soft elegant neon glowing shapes in the background of the left panel */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#357ee3]/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#c379d8]/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }} />

        {/* Top Header Logo (White/Branded) */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl p-1.5 backdrop-blur-md border border-white/20">
            <img 
              src="/isotipo-alianza-rh.svg" 
              alt="Alianza RH Isotipo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">
            Alianza <span className="text-[#c379d8]">RH</span>
          </span>
        </div>

        {/* Centerpiece: Floating Isotipo with Glow and Value Proposition */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center">
          <div className="relative w-52 h-52 mb-10 flex items-center justify-center animate-float">
            {/* Glowing background ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#357ee3] to-[#c379d8] rounded-full blur-3xl opacity-25" />
            <img 
              src="/isotipo-alianza-rh.svg" 
              alt="Alianza RH Grande" 
              className="w-40 h-40 object-contain drop-shadow-[0_15px_30px_rgba(53,126,227,0.3)]" 
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug max-w-md">
            Simplificando el Reclutamiento.<br />
            <span className="bg-gradient-to-r from-[#357ee3] to-[#c379d8] bg-clip-text text-transparent">
              Potenciando el Crecimiento.
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-4 max-w-sm font-medium leading-relaxed">
            Plataforma interna para la gestión ágil de candidatos, vacantes, clientes y leads en tiempo real.
          </p>
        </div>

        {/* Bottom Panel: Interactive Preview Mockup Card */}
        <div className="relative z-10 mt-auto flex justify-center">
          <div className="bg-[#1e293b]/70 border border-slate-700/60 rounded-2xl p-5 w-full max-w-sm backdrop-blur-md shadow-2xl flex items-center gap-4 transition-all hover:border-slate-600/80">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xxs font-bold text-gray-500 uppercase tracking-widest">Reclutamiento Exitoso</p>
              <p className="text-sm font-bold text-white mt-0.5 truncate">Sofía García Morales</p>
              <p className="text-xs text-slate-400 mt-0.5">Contratada • Software Engineer</p>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
              Ganado
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Clean Login Form Container */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center px-6 py-12 md:px-16 relative z-10 bg-slate-50/40 backdrop-blur-xs">
        <div className="mx-auto w-full max-w-md">
          {/* Logo Alianza RH (Visible on both Mobile and Desktop) */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 transition-transform duration-300 hover:scale-103">
              <img 
                src="/logo-alianza-rh.svg" 
                alt="Alianza RH Logo" 
                className="h-16 w-auto object-contain" 
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Acceso Interno Autorizado</span>
            </div>
          </div>

          {/* Form wrapper */}
          <LoginForm />
          
          <p className="text-center text-xxs text-gray-400 font-medium mt-8 leading-relaxed">
            © {new Date().getFullYear()} Alianza RH. Todos los derechos reservados.<br />
            Uso confidencial únicamente para personal autorizado de AlianzaRH.
          </p>
        </div>
      </div>
    </main>
  )
}
