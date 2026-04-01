import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js middleware that handles route protection and authentication redirects.
 * Protects /profile, /garden, /messages, /clients, /calendar, and /analytics routes.
 * @param request - The incoming Next.js request
 * @returns A Next.js response (either the next step or a redirect)
 */
export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip for static files and API routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for auth session cookie
  const sessionCookie = request.cookies.get('authjs.session-token')?.value;
  const secureSessionCookie = request.cookies.get('__Secure-authjs.session-token')?.value;
  const hasSession = !!(sessionCookie || secureSessionCookie);

  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname === '/profile' ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/garden/') ||
    (pathname.startsWith('/gardens/') && !pathname.startsWith('/gardens/public/')) ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/calendar/') ||
    pathname.startsWith('/analytics/');

  const isPublicRoute =
    pathname.startsWith('/gardens/public/') ||
    pathname === '/discover' ||
    pathname.startsWith('/discover');

  // If user is not logged in and trying to access protected route
  if (!hasSession && isProtectedRoute && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
  }

  // If user is on auth page and already logged in, redirect to home
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
