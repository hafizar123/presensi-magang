import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner"; 
import { ThemeProvider } from "@/components/theme-provider";
import SessionTimeout from "@/components/SessionTimeout"; 

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
      <body 
        suppressHydrationWarning={true} // <--- INI OBATNYA BRE
        className={`${inter.className} tracking-tight antialiased`}
      >
        <AuthProvider>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Logic Logout Otomatis */}
            <SessionTimeout />

            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}