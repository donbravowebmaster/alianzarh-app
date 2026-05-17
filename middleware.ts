import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_ROUTES = ['/login', '/crm', '/cotizador', '/clientes']

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  const isApp =
    hostname.startsWith('app.') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1')

  if (isApp) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (APP_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
