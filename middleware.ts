import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone()
    const hostname = request.headers.get('host') || ''

    // Si es entorno local (localhost) o el subdominio app, va a la plataforma
    if (hostname.startsWith('app.') || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      url.pathname = `/app${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }

    // Si es el dominio principal, va a marketing
    if (hostname === 'alianzarh.com' || hostname === 'www.alianzarh.com') {
      url.pathname = `/marketing${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error en middleware:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}