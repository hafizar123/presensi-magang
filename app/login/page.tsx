"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (res?.error) {
        setError("Email atau password salah!");
        setLoading(false);
      } else {
        router.push("/"); 
        router.refresh();
      }
    } catch (error) {
      setError("Server Tidak Terhubung");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 font-sans">
      
      {/* === PERBAIKAN DI SINI === */}
      {/* Gunakan 'fixed' supaya background nempel di layar & ga ikut scroll/zoom */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/bkgdikpora.jpg" 
          alt="Background Login"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#3f2e26]/60 mix-blend-multiply" />
      </div>

      {/* Card Form */}
      <Card className="relative z-10 w-full max-w-[500px] border-white/10 bg-[#2e1d15]/70 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-3 pb-2 text-center">
          <div className="flex justify-center mb-2">
            <Image 
              src="/logo-disdikpora.png" 
              alt="Logo Dinas" 
              width={80} 
              height={80}
              priority
              className="h-auto w-auto object-contain drop-shadow-md"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Login Presensi Magang</h2>
            <p className="text-sm text-[#EAE7DD]/80">
              Masuk untuk melakukan presensi magang harian
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm font-medium text-red-200 bg-red-900/40 border border-red-500/30 rounded-xl text-center animate-in fade-in-50">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#EAE7DD]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EAE7DD]/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan Email"
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#EAE7DD]/40 focus:bg-white/10 focus:border-[#99775C] transition-all rounded-xl"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#EAE7DD]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EAE7DD]/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#EAE7DD]/40 focus:bg-white/10 focus:border-[#99775C] transition-all rounded-xl"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EAE7DD]/60 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1} 
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button className="w-full font-bold mt-6 h-11 rounded-xl bg-[#99775C] text-white hover:bg-[#7a5e48] shadow-lg shadow-black/20" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <p className="text-sm text-[#EAE7DD]/80">
            Belum Memiliki Akun?{" "}
            <Link href="/register" className="text-[#99775C] font-bold hover:text-[#EAE7DD] hover:underline transition-all">
              Daftar di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}