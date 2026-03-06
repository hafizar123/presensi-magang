import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Daftar halaman yang boleh diakses TANPA login (Public)
  // Tambahin "/" biar landing page bisa diakses publik
  const isPublicPage = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // KONDISI 1: User SUDAH Login
  if (token) {
    // Kalau user iseng mau buka halaman login/register lagi, tendang ke /dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // KONDISI 2: User BELUM Login
  if (!token) {
    // Kalau user mencoba akses halaman selain yang public, tendang ke Login
    if (!isPublicPage) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};