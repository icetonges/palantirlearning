// middleware.ts — Auth guard for private routes
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { PRIVATE_ROUTES } from '@/lib/navigation'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  // Check if this is a private route
  const isPrivate = PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isPrivate && !session) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.png|.*\\.svg).*)',
  ],
}
