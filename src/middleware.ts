import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Désactivation temporaire de la vérification d'authentification
  return NextResponse.next();

  /*
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const token = request.cookies.get('next-auth.session-token')?.value;

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return null;
  }

  if (!token) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, request.url));
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: ['/company/dashboard/:path*', '/login'],
};
