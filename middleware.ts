import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que solo existen en la plataforma interna (app.alianzarh.com)
const APP_PATHS = ['/login', '/crm', '/cotizador']

export function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone()
    const hostname = request.headers.get('host') || ''

    // ── Plataforma interna: app.alianzarh.com ───────────────────────────────
    if (hostname.startsWith('app.')) {
      // / no tiene página propia en el subdominio → reescribir a /login
      if (url.pathname === '/') {
        url.pathname = '/login'
        return NextResponse.rewrite(url)
      }
      // Resto de rutas (/login, /crm, /cotizador) → dejar pasar
      return NextResponse.next()
    }

    // ── Sitio marketing: alianzarh.com / localhost ───────────────────────────
    // Bloquear acceso a rutas de la plataforma desde el dominio público
    if (APP_PATHS.some((p) => url.pathname.startsWith(p))) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
