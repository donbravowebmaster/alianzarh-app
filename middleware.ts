import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Las rutas que pertenecen exclusivamente a tu CRM/Plataforma
const APP_ROUTES = ['/login', '/crm', '/cotizador', '/clientes']

export function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone()
    const hostname = request.headers.get('host') || ''
    const pathname = url.pathname

    const isApp = hostname.startsWith('app.') || hostname.includes('localhost') || hostname.includes('127.0.0.1')

    if (isApp) {
      // Si entran a la raíz de la app (app.alianzarh.com/), los mandamos al login
      // Tu layout protegido de (app) ya se encargará de mandarlos a /crm si YA tienen sesión activa
      if (pathname === '/') {
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }

      // Todo lo demás (/crm, /cotizador, /clientes) pasa directo porque Next.js ya sabe dónde están
      return NextResponse.next()
    }

    // Si es el dominio de marketing principal (alianzarh.com)
    // Bloqueamos estrictamente el acceso a las rutas privadas
    if (APP_ROUTES.some(route => pathname.startsWith(route))) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error crítico en middleware:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}