import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "isLoggedIn";
const ROLE_COOKIE_NAME = "user_role";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const loginUrl = new URL("/login", request.url);
  const dashboardAdminUrl = new URL("/admin/dashboard", request.url);
  const dashboardUserUrl = new URL("/", request.url);
  const unauthorizedUrl = new URL("/login", request.url);

  const isLoggedIn = !!sessionCookie && !!roleCookie;
  const userRole = roleCookie?.value; // Sekarang bisa dibaca langsung (plain text)

  console.log("Middleware check:", { isLoggedIn, userRole, pathname }); // Debug log

  // Public routes
  const publicRoutes = ["/", "/tentang", "/kontak", "/about", "/faq"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "admin") {
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  }

  // User routes protection
  const userOnlyRoutes = [
    "/mabar",
    "/field",
    "/pemesanan",
    "/profile",
    "/dashboard",
  ];
  const isUserRoute = userOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isUserRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Redirect authenticated users from login/register pages
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      if (userRole === "admin") {
        return NextResponse.redirect(dashboardAdminUrl);
      } else {
        return NextResponse.redirect(dashboardUserUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/booking/:path*",
    "/dashboard/:path*",
    "/mabar/:path*",
    "/field/:path*",
    "/pemesanan/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
