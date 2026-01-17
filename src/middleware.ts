// .src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname.startsWith("/account");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");

  // Redirect authenticated users away from auth pages
  if (isAuthPage && session) {
    // Check if user is admin from JWT
    const isAdmin = session.user?.user_metadata?.role === "admin";
    
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to sign in
  if ((isDashboardPage || isAdminPage || isOnboarding) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/signin";
    return NextResponse.redirect(url);
  }

  // Check admin access for admin routes using JWT
  if (isAdminPage && session) {
    const isAdmin = session.user?.user_metadata?.role === "admin";

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding",
  ],
};