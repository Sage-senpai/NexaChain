// ============================================
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthPage = request.nextUrl.pathname.startsWith("/account");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");

  // Redirect authenticated users away from auth pages
  if (isAuthPage && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to sign in
  if ((isDashboardPage || isAdminPage || isOnboarding) && !session?.user) {
    return NextResponse.redirect(new URL("/account/signin", request.url));
  }

  // Check admin access
  if (isAdminPage && session?.user) {
    // You'll need to fetch the user's role from the database
    // For now, we'll allow access if they're authenticated
    // In production, implement proper role checking
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding",
  ],
};