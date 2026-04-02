import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PATHS = ["/chat", "/history", "/dashboard", "/profile"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request,
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiresAuth = PROTECTED_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && requiresAuth) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
