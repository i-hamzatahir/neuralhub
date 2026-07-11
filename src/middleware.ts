import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { getRequiredRole, hasMinRole } from "@/lib/auth/policies";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  if (
    isLoggedIn &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password")
  ) {
    const dest = req.auth!.user!.role === "USER" ? "/" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  const requiredRole = getRequiredRole(pathname);

  if (requiredRole) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!hasMinRole(req.auth!.user!, requiredRole)) {
      return NextResponse.redirect(
        new URL("/?error=unauthorized", req.url),
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
