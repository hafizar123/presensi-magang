import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Ambil token session user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Daftar halaman yang boleh diakses TANPA login (Public)
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // KONDISI 1: User SUDAH Login
  if (token) {
    // Kalau user iseng mau buka halaman login/register lagi, tendang ke Dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // KONDISI 2: User BELUM Login
  if (!token) {
    // Kalau user mencoba akses halaman selain login/register, tendang ke Login
    // (Kita kecualikan folder api, _next, dan file gambar biar gak error)
    if (!isAuthPage) {
      const loginUrl = new URL("/login", req.url);
      // Simpan URL tujuan user biar abis login bisa dibalikin kesana (opsional)
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Konfigurasi halaman mana aja yang dijagain Middleware
export const config = {
  matcher: [
    // Match semua path KECUALI yang berawalan:
    // - api (API routes)
    // - _next/static (file statis nextjs)
    // - _next/image (gambar nextjs)
    // - favicon.ico (icon web)
    // - public files (gambar png/jpg/svg)
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};