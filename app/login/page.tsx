"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner"; 
import { Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- LOGIC NOTIFIKASI WAKTU HABIS ---
  useEffect(() => {
    const isTimeout = searchParams.get("timeout") === "true";
    
    if (isTimeout) {
      // Delay dikit biar toast muncul stlh render
      setTimeout(() => {
        toast.error("Sesi Berakhir", {
          description: "Waktu Anda habis (7 Menit Inaktif). Silakan login ulang.",
          duration: 8000, // Durasi lama biar kebaca
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        });
      }, 100);
    }
  }, [searchParams]);
  // ------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ambil callbackUrl dari URL (contoh: /riwayat), default ke dashboard (/)
      const callbackUrl = searchParams.get("callbackUrl") || "/";

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Gagal Masuk", {
          description: "Email atau password salah, coba lagi bre.",
        });
      } else {
        toast.success("Berhasil Masuk", {
          description: "Selamat datang kembali!",
        });
        // Redirect balik ke halaman terakhir
        router.push(callbackUrl); 
        router.refresh();
      }
    } catch (error) {
      toast.error("Error", {
        description: "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F5F8] dark:bg-[#0c0a09] p-4 relative overflow-hidden">
        {/* Background Bubbles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#99775C]/10 dark:bg-[#99775C]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#8a6b52]/10 dark:bg-[#8a6b52]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-sm z-10 animate-in fade-in zoom-in-95 duration-500">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-[#99775C]/10 rounded-2xl">
                        <Image src="/logo-disdikpora.png" width={48} height={48} alt="Logo" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-[#99775C]">Login Akun</CardTitle>
                <CardDescription>Masukkan kredensial untuk mengakses sistem</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="bg-white dark:bg-[#292524]" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="bg-white dark:bg-[#292524] pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-[#99775C] hover:bg-[#8a6b52] text-white font-bold transition-all" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proses...</> : "Masuk Sekarang"}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Belum punya akun? <Link href="/register" className="text-[#99775C] hover:underline font-bold">Daftar Magang</Link>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}