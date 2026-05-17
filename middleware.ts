import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas exclusivas de la plataforma interna
const APP_PATHS = ['/login', '/crm', '/cotizador']

export function middleware(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || ''
    const { pathname } = request.nextUrl

    // ── Plataforma interna: app.alianzarh.com | app.localhost (prod)
    //                        localhost (dev)
    const isApp =
      hostname.startsWith('app.') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'

    if (isApp) {
      // / no tiene página propia → reescribir a /login
      if (pathname === '/') {
        return NextResponse.rewrite(new URL('/login', request.url))
      }
      return NextResponse.next()
    }

    // ── Sitio marketing: alianzarh.com / www.alianzarh.com ──────────────────
    // Bloquear rutas de la plataforma en el dominio público
    if (APP_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
