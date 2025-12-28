// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protege as rotas de admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/p/admin")) {
    const authCookie = request.cookies.get("apex_auth");

    // Se o cookie secreto (HttpOnly) não existir, redireciona para o login
    if (!authCookie) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  return NextResponse.next();
}

// Configura em quais caminhos o middleware deve atuar
export const config = {
  matcher: ["/admin", "/p/admin/:path*"],
};
