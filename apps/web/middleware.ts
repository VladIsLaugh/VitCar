import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes — check cookie presence only (JWT validity enforced by the API)
  if (pathname.includes('/dashboard')) {
    const hasRefreshCookie = request.cookies.has('refresh_token');
    if (!hasRefreshCookie) {
      const locale = pathname.split('/')[1] ?? 'uk';
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
