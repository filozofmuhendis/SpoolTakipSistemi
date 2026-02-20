import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50,
  apiWindowMs: 1 * 60 * 1000, // 1 minute
  apiMaxRequests: 30,
}

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Sayfa bazlı rol gereksinimleri
const roleRequirements: Record<string, string[]> = {
  '/admin': ['admin'],
  '/reports': ['admin', 'manager'],
  '/materials/manage': ['admin', 'manager'],
  '/personnel/manage': ['admin', 'manager'],
  '/projects/create': ['admin', 'manager'],
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  if (realIP) return realIP
  return 'unknown'
}

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const ip = getClientIP(req as NextRequest)
    const isApiRoute = path.startsWith('/api')

    // Apply security headers
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Advanced Rate Limiting
    const { isRateLimited } = await import('./lib/rateLimit')
    const limit = isApiRoute ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests
    const windowSecs = (isApiRoute ? RATE_LIMIT.apiWindowMs : RATE_LIMIT.windowMs) / 1000
    const rateLimited = await isRateLimited(`${ip}:${isApiRoute ? 'api' : 'web'}`, limit, windowSecs)

    if (rateLimited) {
      if (isApiRoute) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
              code: 'RATE_LIMIT_EXCEEDED',
            },
          },
          { status: 429 }
        )
      } else {
        return NextResponse.redirect(new URL('/rate-limit', req.url))
      }
    }

    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!token && path !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Rol kontrolü
    if (token?.role) {
      const requiredRoles = Object.entries(roleRequirements).find(([route]) =>
        path.startsWith(route)
      )?.[1]

      if (requiredRoles && !requiredRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Add user info to headers for API routes
    if (isApiRoute && token) {
      response.headers.set('x-user-id', token.sub || '')
      response.headers.set('x-user-email', token.email || '')
      response.headers.set('x-user-role', (token.role as string) || 'user')
    }

    return response
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
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|reset-password|new-password|error|test-profiles).*)',
  ]
}
