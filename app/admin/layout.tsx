import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import SessionTimeout from "@/components/SessionTimeout"; // <-- IMPORT INI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIP-MAGANG",
  description: "Sistem Presensi Magang Disdikpora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SessionTimeout /> {/* <-- PASANG DISINI, WAJIB! */}
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}