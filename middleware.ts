import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/signup'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // API routes protection
  if (pathname.startsWith('/api/')) {
    // Allow public auth routes
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/signup')) {
      return NextResponse.next();
    }

    // Allow public emergency API route (NO AUTHENTICATION REQUIRED)
    if (pathname.startsWith('/api/emergency/')) {
      return NextResponse.next();
    }

    // Protect all other API routes
    const token = extractToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Attach userId to request headers for use in route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Page routes protection
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/doctor')) {
    const token = extractToken(request);
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = verifyToken(token);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login') {
    const token = extractToken(request);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/doctor/:path*',
    '/login',
  ],
};
