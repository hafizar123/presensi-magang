import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner"; 
import { ThemeProvider } from "@/components/theme-provider";
import SessionTimeout from "@/components/SessionTimeout"; // 1. IMPORT

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SIP-MAGANG",
  description: "Sistem Presensi Magang Disdikpora",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body className={`${inter.className} tracking-tight antialiased`}>
        <AuthProvider>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* 2. PASANG DISINI (DI DALAM AUTH PROVIDER) */}
            {/* Logic ini bakal jalan di User DAN Admin secara otomatis */}
            <SessionTimeout />

            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}