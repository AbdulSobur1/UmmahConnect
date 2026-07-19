import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const authRoutes = ["/login", "/signup", "/reset-password", "/update-password"];

const protectedPrefixes = [
  "/feed", "/messages", "/notifications",
  "/settings", "/mentorship", "/discover", "/dashboard",
];

const protectedExact = ["/profile", "/jobs"];

const publicPrefixes = ["/profiles/", "/posts/", "/communities/"];

const publicApi = [
  "/api/health", "/api/payments/webhook", "/api/payments/verify",
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Create a response early so we can set cookies on it
  const res = NextResponse.next({ request: req });

  // Create Supabase client for this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          res.cookies.set(name, "", options);
        },
      },
    },
  );

  // Refresh session (important for SSO / token refresh)
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ?? null;

  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Allow public pages (landing, auth pages for non-authenticated users)
  if (authRoutes.some((r) => pathname === r)) {
    return res;
  }

  if (pathname === "/") {
    return res;
  }

  // Allow public API routes
  if (publicApi.some((r) => pathname.startsWith(r))) {
    return res;
  }

  // Allow public profile/post/community pages
  for (const prefix of publicPrefixes) {
    if (pathname.startsWith(prefix)) {
      return res;
    }
  }

  // All other API routes handle their own auth
  if (pathname.startsWith("/api/")) {
    return res;
  }

  const isProtected =
    protectedPrefixes.some((r) => pathname.startsWith(r)) ||
    protectedExact.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
