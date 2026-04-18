import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackURL', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only protect the (app) route group. (public)/, (auth)/, and /api/* stay open.
// The matcher uses the actual URL path (route group folders don't appear).
export const config = {
  matcher: [
    '/chat/:path*',
    '/assessment/:path*',
    '/summary/:path*',
    '/results/:path*',
    '/history/:path*',
  ],
};
