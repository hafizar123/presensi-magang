import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner"; 
import { ThemeProvider } from "@/components/theme-provider"; // <--- IMPORT INI

const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presensi Magang Dinas DIKPORA",
  description: "Sistem Presensi Magang",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body className={inter.className}>
        <AuthProvider>
           {/* Bungkus semuanya pake ThemeProvider */}
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}