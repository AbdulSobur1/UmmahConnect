import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Allow public pages (landing, auth pages for non-authenticated users)
  if (authRoutes.some((r) => pathname === r)) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApi.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow public profile/post/community pages
  for (const prefix of publicPrefixes) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // All other API routes handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isProtected =
    protectedPrefixes.some((r) => pathname.startsWith(r)) ||
    protectedExact.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
