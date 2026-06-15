import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kavitas-kitchen-super-secret-key-12345"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Process /admin paths
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_session")?.value;

    // If hitting login page
    if (pathname === "/admin/login") {
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET);
          // Valid token -> redirect to dashboard
          return NextResponse.redirect(new URL("/admin", req.url));
        } catch (e) {
          // Token is invalid -> proceed to login page and clear cookie
          const res = NextResponse.next();
          res.cookies.delete("admin_session");
          return res;
        }
      }
      return NextResponse.next();
    }

    // Securing all other dashboard paths
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (e) {
      // Invalid token -> redirect to login and wipe session cookie
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.delete("admin_session");
      return res;
    }
  }

  // 2. Process customer-restricted paths (/profile, /checkout)
  if (pathname.startsWith("/profile") || pathname.startsWith("/checkout")) {
    const token = req.cookies.get("session")?.value;

    if (!token) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (e) {
      // Invalid session -> redirect to login and clear cookie
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete("session");
      return res;
    }
  }

  return NextResponse.next();
}

// Limit the middleware to run on admin, profile, and checkout routes
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/checkout/:path*"],
};
