import { NextResponse, type NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // Pass through all requests in static/demo mode
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Empty or matching nothing to avoid intercepting calls
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
