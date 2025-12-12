import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for server-side authentication protection
 * Protects /dashboard routes by checking for session cookie
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for session cookie (better-auth uses "orbis_session_token")
    const sessionToken = request.cookies.get('__Secure-orbis_session_token') || request.cookies.get('orbis_session_token')
    const isAuthenticated = !!sessionToken;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
        const dashboardUrl = new URL('/dashboard/profile', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // Protect dashboard routes - redirect unauthenticated users to login
    if (pathname.startsWith('/dashboard')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url);
            // Add redirect parameter to return to requested page after login
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};
