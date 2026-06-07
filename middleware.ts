import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/update-password',
];

const BROWSEABLE_ROUTES = [
  '/profiles',
  '/posts',
  '/communities',
  '/jobs',
  '/events',
];

const PROTECTED_ROUTES = [
  '/feed',
  '/messages',
  '/notifications',
  '/settings',
  '/mentorship',
  '/discover',
  '/dashboard',
];

const AUTH_COOKIE_NAMES = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'auth-token'];

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET || '';

function getTokenFromRequest(request: NextRequest) {
  for (const name of AUTH_COOKIE_NAMES) {
    const cookie = request.cookies.get(name);
    if (cookie?.value) {
      return cookie.value;
    }
  }
  return null;
}

async function verifyToken(token: string) {
  if (!JWT_SECRET) return null;
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  const token = getTokenFromRequest(request);
  const user = token ? await verifyToken(token) : null;

  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
