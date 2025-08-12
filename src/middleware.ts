import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

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

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  apiWindowMs: 1 * 60 * 1000, // 1 minute for API routes
  apiMaxRequests: 20, // limit each IP to 20 API requests per minute
}

// Sayfa bazlı rol gereksinimleri
const roleRequirements = {
  '/admin': ['admin'],
  '/reports': ['admin', 'manager'],
  '/materials/manage': ['admin', 'manager'],
  '/personnel/manage': ['admin', 'manager'],
  '/projects/create': ['admin', 'manager'],
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function isRateLimited(ip: string, isApiRoute: boolean): boolean {
  const now = Date.now()
  const windowMs = isApiRoute ? RATE_LIMIT.apiWindowMs : RATE_LIMIT.windowMs
  const maxRequests = isApiRoute ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests
  
  const key = `${ip}:${isApiRoute ? 'api' : 'web'}`
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return false
  }
  
  if (record.count >= maxRequests) {
    return true
  }
  
  record.count++
  return false
}

function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up rate limit store every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000)

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const ip = getClientIP(req as NextRequest)
    const isApiRoute = path.startsWith('/api')
    
    // Apply security headers
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Rate limiting
    if (isRateLimited(ip, isApiRoute)) {
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
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|reset-password|new-password|error).*)',
  ]
}
