import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that are fully public — no auth needed at all
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/update-password',
  ];

  // Route prefixes that are publicly browsable (read-only)
  const browseableRoutes = [
    '/profiles',
    '/posts',
    '/communities',
    '/jobs',
    '/events',
  ];

  // Routes that always require authentication
  const protectedRoutes = [
    '/feed',
    '/messages',
    '/notifications',
    '/settings',
    '/mentorship',
    '/discover',
    '/dashboard',
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isBrowseable = browseableRoutes.some((r) => pathname.startsWith(r));
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isApiRoute = pathname.startsWith('/api/');

  // Build response with session refresh
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Block unauthenticated access to protected routes
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Public and browseable routes pass through freely
  // API routes handle their own auth internally
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
