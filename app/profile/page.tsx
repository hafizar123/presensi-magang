"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Camera, User, Mail, Lock, Eye, EyeOff, 
  Save, Loader2, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load data awal
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  const handleSave = async () => {
    // Validasi sederhana
    if (!formData.name) return alert("Nama tidak boleh kosong!");
    if (formData.password && formData.password !== formData.confirmPassword) {
      return alert("Konfirmasi password tidak cocok!");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        // Refresh & Redirect setelah 1.5 detik
        setTimeout(() => {
            window.location.href = "/"; // Pakai href biar full reload session
        }, 1500);
      } else {
        alert("Gagal menyimpan perubahan");
      }
    } catch (error) {
      alert("Terjadi kesalahan server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      
      {/* HEADER SIMPLE */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 px-4 flex items-center justify-between">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
            <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Profil</h1>
        <div className="w-10"></div> {/* Spacer biar judul di tengah */}
      </header>

      <main className="pt-24 pb-10 px-6 max-w-md mx-auto">
        
        {/* FOTO PROFIL */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-slate-100 dark:border-slate-800 shadow-xl">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=0D8ABC&color=fff`} />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                
                {/* Tombol Kamera (Visual Only utk sekarang) */}
                <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-transform active:scale-90 border-4 border-white dark:border-slate-950">
                    <Camera className="h-4 w-4" />
                </button>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Ketuk ikon kamera untuk ganti foto
            </p>
        </div>

        {/* FORM INPUT */}
        <div className="space-y-5">
            
            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 ml-1">Nama Lengkap</Label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-12 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500" 
                        placeholder="Nama kamu"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 ml-1">Email (Tidak bisa diubah)</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        value={formData.email}
                        disabled
                        className="pl-12 h-12 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl text-slate-500" 
                    />
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 ml-1">Password Baru (Opsional)</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        type={showPass ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="pl-12 pr-12 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500" 
                        placeholder="••••••"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 ml-1">Konfirmasi Password</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        type={showConfirmPass ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="pl-12 pr-12 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500" 
                        placeholder="••••••"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                        {showConfirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

        </div>

        {/* BUTTON SIMPAN */}
        <div className="mt-10">
            {isSuccess ? (
                <Button className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 text-lg font-bold transition-all animate-in zoom-in">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Berhasil Disimpan!
                </Button>
            ) : (
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-lg font-bold transition-all active:scale-95"
                >
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Simpan Perubahan
                </Button>
            )}
        </div>

      </main>
    </div>
  );
}