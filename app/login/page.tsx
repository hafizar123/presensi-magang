"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. STATE REMEMBER ME
  const [rememberMe, setRememberMe] = useState(false);

  // 2. CEK PENYIMPANAN SAAT LOAD
  useEffect(() => {
    const savedData = localStorage.getItem("magangCreds");
    if (savedData) {
      try {
        const parsed = JSON.parse(atob(savedData)); // Decode rahasia
        setEmail(parsed.e);
        setPassword(parsed.p);
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem("magangCreds");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Gagal Masuk", { description: "Email / Password yang Anda masukkan salah." });
        setLoading(false);
      } else {
        // 3. LOGIC SIMPAN / HAPUS INFO
        if (rememberMe) {
             const secretData = btoa(JSON.stringify({ e: email, p: password }));
             localStorage.setItem("magangCreds", secretData);
        } else {
             localStorage.removeItem("magangCreds");
        }

        toast.success("Login Berhasil");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Error", { description: "Terjadi kesalahan sistem." });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#1c1917]">
        
        {/* --- BACKGROUND --- */}
        <div className="absolute inset-0 z-0">
            <Image 
                src="/bkgdikpora.jpg" 
                alt="Background" 
                fill 
                className="object-cover opacity-40 blur-sm scale-105"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-[#0c0a09]/50" />
        </div>

        {/* --- CARD UTAMA --- */}
        <div className="relative z-10 w-full max-w-[400px] px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="absolute inset-0 bg-[#99775C] blur-[60px] opacity-20 rounded-full pointer-events-none transform translate-y-4"></div>

            <div className="bg-white dark:bg-[#0c0a09] border border-white/20 dark:border-[#292524] rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#99775C] to-[#7a5e48]"></div>

                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="p-3 bg-slate-50 dark:bg-[#1c1917] rounded-2xl shadow-sm border border-slate-100 dark:border-[#292524]">
                        <Image src="/logo-disdikpora.png" width={42} height={42} alt="Logo" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Portal Presensi</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">Masuk untuk memulai sesi magang.</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">Email</Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                            <Input 
                                type="email" 
                                required 
                                placeholder="Masukkan Email" 
                                className="h-11 pl-10 bg-slate-50 dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-xl focus-visible:ring-[#99775C] transition-all font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">Password</Label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                            <Input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                placeholder="••••••" 
                                className="h-11 pl-10 pr-10 bg-slate-50 dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-xl focus-visible:ring-[#99775C] transition-all font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* --- CHECKBOX REMEMBER ME (Di sini letaknya) --- */}
                    <div className="flex items-center gap-2 pt-1 px-1">
                        <input 
                            type="checkbox" 
                            id="remember" 
                            className="h-4 w-4 rounded border-slate-300 text-[#99775C] focus:ring-[#99775C] cursor-pointer"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember" className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none hover:text-[#99775C] transition-colors">
                            Simpan info login
                        </label>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-[#99775C] hover:bg-[#7a5e48] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#99775C]/20 transition-all active:scale-[0.98] mt-2" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                Masuk Sekarang 
                            </div>
                        )}
                    </Button>

                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#292524] text-center">
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-bold text-[#99775C] hover:text-[#7a5e48] transition-colors">
                            Daftar Disini
                        </Link>
                    </p>
                </div>

            </div>
            
            <div className="mt-6 text-center">
                <p className="text-xs text-white/30 font-medium">
                    © 2026 SIP-MAGANG Disdikpora DIY by IF UPNVY
                </p>
            </div>

        </div>
    </div>
  );
}