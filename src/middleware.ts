import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Sayfa bazlı rol gereksinimleri
const roleRequirements = {
  '/admin': ['admin'],
  '/reports': ['admin', 'manager'],
  '/materials/manage': ['admin', 'manager'],
  '/personnel/manage': ['admin', 'manager'],
  '/projects/create': ['admin', 'manager'],
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!token && path !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Rol kontrolü
    if (token?.role) {
      // Sayfa için rol gereksinimi var mı kontrol et
      const requiredRoles = Object.entries(roleRequirements).find(([route]) => 
        path.startsWith(route)
      )?.[1]

      // Eğer sayfa rol gerektiriyorsa ve kullanıcının rolü uygun değilse
      if (requiredRoles && !requiredRoles.includes(token.role as string)) {
        // Ana sayfaya yönlendir
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login',
      error: '/error'
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|error).*)',
  ]
}
