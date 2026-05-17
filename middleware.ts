import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/crm', '/cotizador']
const LOGIN = '/login'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? 'localhost'
  const { pathname } = request.nextUrl

  // app.alianzarh.com  |  app.localhost (dev)
  const isApp = hostname.startsWith('app.')

  if (isApp) {
    let supabaseResponse = NextResponse.next({ request })
    let user = null

    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              supabaseResponse = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // Supabase no disponible: tratar como no autenticado
    }

    // / → reescribir a /login (no auth) o /crm (auth)
    if (pathname === '/') {
      const target = user ? '/crm' : LOGIN
      return NextResponse.rewrite(new URL(target, request.url))
    }

    // Autenticado en login → /crm
    if (pathname === LOGIN && user) {
      return NextResponse.redirect(new URL('/crm', request.url))
    }

    // Protegidas sin sesión → /login
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
