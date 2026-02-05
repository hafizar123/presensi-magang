"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle2, IdCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [name, setName] = useState("");
  const [nip, setNip] = useState(""); // State Baru
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Validasi Gagal", { description: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    setLoading(true);

    try {
      // Kirim NIP juga ke API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nip, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftar");
      }

      toast.success("Registrasi Berhasil", { description: "Akun Anda telah dibuat. Silakan masuk." });
      router.push("/login");
    } catch (error: any) {
      toast.error("Gagal Mendaftar", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#1c1917]">
        
        {/* --- 1. BACKGROUND --- */}
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

        {/* --- 2. CARD CONTAINER --- */}
        <div className="relative z-10 w-full max-w-[480px] px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-[#99775C] blur-[60px] opacity-20 rounded-full pointer-events-none transform translate-y-4"></div>

            <div className="bg-white dark:bg-[#0c0a09] border border-white/20 dark:border-[#292524] rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                
                {/* Aksen Garis Atas */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#99775C] to-[#7a5e48]"></div>

                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="p-3 bg-slate-50 dark:bg-[#1c1917] rounded-2xl shadow-sm border border-slate-100 dark:border-[#292524]">
                        <Image src="/logo-disdikpora.png" width={42} height={42} alt="Logo" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Registrasi Peserta</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">Buat akun baru untuk memulai magang.</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    
                    {/* Nama Lengkap */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">Nama Lengkap</Label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                            <Input 
                                type="text" 
                                required 
                                placeholder="Masukkan Nama Lengkap" 
                                className="h-11 pl-10 bg-slate-50 dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-xl focus-visible:ring-[#99775C] transition-all font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* NIP / NIM (FIELD BARU) */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">NIP / NIM</Label>
                        <div className="relative group">
                            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                            <Input 
                                type="text" 
                                required 
                                placeholder="Masukkan NIP / NIM" 
                                className="h-11 pl-10 bg-slate-50 dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-xl focus-visible:ring-[#99775C] transition-all font-medium"
                                value={nip}
                                onChange={(e) => setNip(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email */}
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

                    {/* Password Grid (Sebelahan) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">Kata Sandi</Label>
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
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] p-1">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">Konfirmasi</Label>
                            <div className="relative group">
                                <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${confirmPassword && password === confirmPassword ? "text-green-500" : "text-slate-400 group-focus-within:text-[#99775C]"}`} />
                                <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    required 
                                    placeholder="••••••" 
                                    className={`h-11 pl-10 pr-10 bg-slate-50 dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-xl focus-visible:ring-[#99775C] transition-all font-medium ${confirmPassword && password !== confirmPassword ? "border-red-500 focus-visible:border-red-500" : ""}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] p-1">
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-[#99775C] hover:bg-[#7a5e48] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#99775C]/20 transition-all active:scale-[0.98] mt-4" 
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                Daftar Sekarang 
                            </div>
                        )}
                    </Button>

                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-[#292524] text-center">
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-bold text-[#99775C] hover:text-[#7a5e48] transition-colors">
                            Masuk Disini
                        </Link>
                    </p>
                </div>

            </div>
            
            {/* Copyright Footer */}
            <div className="mt-6 text-center">
                <p className="text-xs text-white/30 font-medium">
                    © 2026 SIP-MAGANG Disdikpora DIY by IF UPNVY
                </p>
            </div>

        </div>
    </div>
  );
}