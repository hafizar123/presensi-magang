"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Camera, User, Mail, Lock, Eye, EyeOff, 
  Loader2, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EditProfilePage() {
  const { data: session } = useSession();
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
        image: (session.user as any).image || ""
      }));
    }
  }, [session]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("File kegedean bre! Maksimal 2MB ya.");
        return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.set("file", file);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
        });
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

  const handleSave = async () => {
    if (!formData.name || !formData.email) return alert("Nama dan Email wajib diisi bre!");
    if (formData.password && formData.password !== formData.confirmPassword) {
      return alert("Password ga sama tuh, cek lagi!");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email, 
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          image: formData.image
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
            window.location.href = "/"; 
        }, 1500);
      } else {
        alert("Gagal update profil.");
      }
    } catch (error) {
      alert("Ada masalah koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans pb-20 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 z-50 flex items-center justify-between px-4 md:px-6 transition-all">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 -ml-2 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="md:hidden text-blue-600 dark:text-blue-400 font-medium text-base cursor-pointer" onClick={() => router.back()}>Kembali</span>
        </div>
        <h1 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">Edit Profil</h1>
        <div className="w-10"></div>
      </header>

      <main className="pt-24 md:pt-28 px-4 md:px-0 max-w-xl mx-auto space-y-8">
        <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white dark:border-zinc-900 shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={formData.image || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=007AFF&color=fff&size=256`} className="object-cover" />
                    <AvatarFallback className="text-4xl">ME</AvatarFallback>
                </Avatar>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="absolute bottom-1 right-1 z-20 bg-slate-900 dark:bg-white text-white dark:text-black p-2.5 rounded-full shadow-lg border-4 border-white dark:border-black transition-transform active:scale-90 hover:bg-blue-600 dark:hover:bg-slate-200">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
                {isUploading ? "Mengupload..." : "Ubah Foto Profil"}
            </p>
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-md overflow-hidden shadow-sm border border-slate-200/50 dark:border-none">
                <div className="flex items-center pl-6 pr-6 py-2 relative">
                    <div className="w-8 shrink-0 flex justify-center"><User className="h-5 w-5 text-slate-400" /></div>
                    <div className="flex-1 ml-4 border-b border-slate-100 dark:border-slate-800 py-3 flex items-center justify-between">
                         <div className="flex flex-col w-full">
                            <Label className="text-xs text-slate-400 mb-1 font-normal">Nama Lengkap</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="border-none shadow-none p-0 h-auto font-medium text-base md:text-lg bg-transparent focus-visible:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white" placeholder="Siapa nama lo?" />
                         </div>
                    </div>
                </div>
                <div className="flex items-center pl-6 pr-6 py-2 relative">
                    <div className="w-8 shrink-0 flex justify-center"><Mail className="h-5 w-5 text-slate-400" /></div>
                    <div className="flex-1 ml-4 py-3 flex items-center justify-between">
                         <div className="flex flex-col w-full">
                            <Label className="text-xs text-slate-400 mb-1 font-normal">Email Address</Label>
                            <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border-none shadow-none p-0 h-auto font-medium text-base text-slate-900 dark:text-white bg-transparent focus-visible:ring-0" placeholder="email@baru.com" />
                         </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Keamanan Akun</h3>
                <div className="bg-white dark:bg-[#1C1C1E] rounded-md overflow-hidden shadow-sm border border-slate-200/50 dark:border-none">
                    <div className="flex items-center pl-6 pr-6 py-2 relative">
                        <div className="w-8 shrink-0 flex justify-center">
                            <div className="bg-orange-500/10 p-1.5 rounded-md"><Lock className="h-4 w-4 text-orange-500" /></div>
                        </div>
                        <div className="flex-1 ml-4 border-b border-slate-100 dark:border-slate-800 py-3 flex items-center">
                            <Input type={showPass ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="border-none shadow-none p-0 h-auto font-medium text-base bg-transparent focus-visible:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white w-full" placeholder="Password Baru" />
                            <button onClick={() => setShowPass(!showPass)} type="button" className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center pl-6 pr-6 py-2 relative">
                        <div className="w-8 shrink-0 flex justify-center">
                            <div className="bg-green-500/10 p-1.5 rounded-md"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
                        </div>
                        <div className="flex-1 ml-4 py-3 flex items-center">
                            <Input type={showConfirmPass ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="border-none shadow-none p-0 h-auto font-medium text-base bg-transparent focus-visible:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white w-full" placeholder="Ulangi Password" />
                             <button onClick={() => setShowConfirmPass(!showConfirmPass)} type="button" className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                                {showConfirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                <p className="px-6 text-[10px] text-slate-400">Kosongkan jika gak mau ganti password.</p>
            </div>
        </div>

        <div className="pt-4 md:pt-8 pb-8">
            {isSuccess ? (
                <Button className="w-full h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 text-lg font-bold transition-all animate-in zoom-in cursor-default ring-0">
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    Berhasil Disimpan!
                </Button>
            ) : (
                <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full h-14 rounded-xl bg-[#007AFF] hover:bg-blue-600 active:scale-95 text-white shadow-xl shadow-blue-500/20 text-lg font-bold transition-all disabled:opacity-70">
                    {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Simpan Perubahan"}
                </Button>
            )}
        </div>
      </main>
    </div>
  );
}