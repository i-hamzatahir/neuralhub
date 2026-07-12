import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { getRequiredRole, hasMinRole } from "@/lib/auth/policies";
import { NextResponse } from "next/server";

const personalSite = process.env.NEXT_PUBLIC_PERSONAL_SITE !== "false";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  if (personalSite && pathname === "/register") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (personalSite && pathname === "/write") {
    if (isLoggedIn && hasMinRole(req.auth!.user!, "AUTHOR")) {
      return NextResponse.redirect(new URL("/dashboard/articles/new", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

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
    "/write",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
