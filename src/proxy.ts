import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isTrainerRoute = pathname.startsWith("/trainer");

  if (!isAdminRoute && !isTrainerRoute) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // A Trainer never sees Admin pages and vice versa — each role is routed to
  // its own home instead of a bare 403 to keep the redirect useful.
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/trainer", req.nextUrl.origin));
  }
  if (isTrainerRoute && role !== "TRAINER") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/trainer/:path*"],
};
