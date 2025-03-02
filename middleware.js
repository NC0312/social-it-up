// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {

  const env = process.env.NEXT_PUBLIC_ENV
  

  const protectedRoutes = ['/admin-panel69', '/review-panel69', '/bug-panel69','/rating-dashboard69', '/login']
  

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  

  if (env === 'production' && isProtectedRoute) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }
  
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin-panel69/:path*',
    '/review-panel69/:path*',
    '/bug-panel69/:path*',
    '/login/:path*',
    '/rating-dashboard69/:path*'
  ]
}