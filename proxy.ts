import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED = ['/crm', '/cotizador']
const LOGIN = '/login'

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? 'localhost'
  const { pathname } = request.nextUrl

  // app.alianzarh.com  |  app.localhost (dev)
  const isApp = hostname.startsWith('app.')

  if (isApp) {
    let user = null
    let supabaseResponse = NextResponse.next({ request })

    try {
      const session = await updateSession(request)
      user = session.user
      supabaseResponse = session.supabaseResponse
    } catch {
      // Si Supabase falla (cold start, timeout), se trata como no autenticado
    }

    // / → reescribir internamente a /login (no autenticado) o /crm (autenticado)
    if (pathname === '/') {
      const target = user ? '/crm' : LOGIN
      return NextResponse.rewrite(new URL(target, request.url))
    }

    // Usuario autenticado que vuelve al login → /crm
    if (pathname === LOGIN && user) {
      return NextResponse.redirect(new URL('/crm', request.url))
    }

    // Rutas protegidas sin sesión → /login
    if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
      return NextResponse.redirect(new URL(LOGIN, request.url))
    }

    return supabaseResponse
  }

  // Dominio marketing: bloquear rutas de la plataforma
  if ([...PROTECTED, LOGIN].some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
