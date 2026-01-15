"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Camera, User, Mail, Lock, Eye, EyeOff, 
  Loader2, CheckCircle2, Save, UploadCloud,
  ShieldCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: ""
  });
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
        image: session.user?.image || ""
      }));
    }
  }, [session]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("File kegedean bre! Maksimal 2MB.");
        return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.set("file", file);

    try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        const result = await res.json();
        
        if (result.success) {
            setFormData(prev => ({ ...prev, image: result.filepath }));
        } else {
            alert("Gagal upload foto");
        }
    } catch (error) {
        alert("Error upload foto");
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
        setIsSaving(false);
        return alert("Password baru ga cocok bre!");
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal");
      
      // LOGIC PENTING: Update Session Client-Side biar foto langsung ganti
      // tanpa perlu refresh halaman
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          image: formData.image,
        },
      });
      
      setIsSuccess(true);
      
      // Reset password field
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      
      setTimeout(() => {
          setIsSuccess(false);
          router.refresh(); 
      }, 2000);

    } catch (error) {
      alert("Gagal simpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 pt-6 font-sans">
      <main className="max-w-5xl mx-auto px-4 md:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan Akun</h1>
                <p className="text-slate-500 text-sm mt-1">Kelola informasi profil dan keamanan akunmu.</p>
            </div>
            {isSuccess && (
                <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-1.5 text-sm h-fit self-start md:self-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Berhasil Disimpan!
                </Badge>
            )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: AVATAR CARD */}
            <div className="md:col-span-4 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <CardTitle className="text-base font-semibold">Foto Profil</CardTitle>
                        <CardDescription className="text-xs">Klik foto untuk mengubah.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8 flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {/* Glowing Ring */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-slate-950 shadow-xl relative z-10">
                                <AvatarImage src={formData.image || `https://ui-avatars.com/api/?name=${formData.name}&background=0F172A&color=fff`} className="object-cover" />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>

                            {/* Floating Edit Icon */}
                            <div className="absolute bottom-2 right-2 z-20 bg-slate-900 dark:bg-white text-white dark:text-black p-2.5 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-950 transition-transform active:scale-95 hover:bg-blue-600 dark:hover:bg-slate-200">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            </div>
                        </div>
                        
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        
                        <p className="text-xs text-slate-400 mt-6 text-center px-4">
                            Format: JPG, PNG, GIF. Maks 2MB.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: FORM INPUTS */}
            <div className="md:col-span-8 space-y-6">
                
                {/* 1. PERSONAL INFO */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-base font-semibold">Informasi Pribadi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</Label>
                            <div className="relative">
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    className="pl-3 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors" 
                                    placeholder="Nama Lengkap" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</Label>
                            <div className="relative">
                                <Input 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    className="pl-3 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors" 
                                    placeholder="email@kamu.com" 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. SECURITY */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-orange-500" />
                                <CardTitle className="text-base font-semibold">Keamanan</CardTitle>
                            </div>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                                Opsional
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-2 relative">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password Baru</Label>
                                <Input 
                                    type={showPass ? "text" : "password"} 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    className="pr-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors" 
                                    placeholder="••••••" 
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="space-y-2 relative">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ulangi Password</Label>
                                <Input 
                                    type={showConfirmPass ? "text" : "password"} 
                                    value={formData.confirmPassword} 
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                                    className="pr-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors" 
                                    placeholder="••••••" 
                                />
                                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                                Kosongkan kolom password jika kamu tidak ingin mengubahnya. Password minimal 6 karakter untuk keamanan yang lebih baik.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* SAVE BUTTON */}
                <div className="flex justify-end pt-2">
                    <Button 
                        type="submit" 
                        disabled={isSaving || isUploading}
                        className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70 disabled:scale-100"
                    >
                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
                    </Button>
                </div>

            </div>
        </form>
      </main>
    </div>
  );
}