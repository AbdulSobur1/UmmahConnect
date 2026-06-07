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
        getAll: () => request.cookies.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value })),
        setAll: (cookies: Array<{ name: string; value: string; options?: any }>) => {
          for (const cookie of cookies) {
            response.cookies.set({ name: cookie.name, value: cookie.value, ...cookie.options });
          }
        },
      },
    }
  );

  let user = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    // If auth lookup fails in middleware, continue as guest rather than crashing the whole request.
    user = null;
  }

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
