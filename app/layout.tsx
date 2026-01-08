import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// 1. IMPORT PROVIDERS YANG BARU DIBIKIN
import Providers from "@/components/Providers";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presensi Magang Dinas",
  description: "Sistem Presensi Internal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        {/* 2. BUNGKUS CHILDREN PAKE PROVIDERS */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}