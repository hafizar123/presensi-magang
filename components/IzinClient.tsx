"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  History, FileText, User, Menu, LayoutDashboard, 
  Calendar, Upload, Send, Loader2, Clock, X, CheckCircle2, LogOut, GraduationCap, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IzinClientProps {
  user: any;
  requests: any[];
}

export default function IzinClient({ user, requests }: IzinClientProps) {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false); // State baru buat modal logout mandiri
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({ date: "", reason: "", proofFile: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStartAnimation(true);
  }, []);

  const getFileUrl = (path: string) => {
    if (!path) return "#";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/^\/+/, "").replace(/^uploads\//, "");
    return `/uploads/${cleanPath}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        toast.error("File terlalu besar", { description: "Maksimal ukuran file 2MB." });
        return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("type", "izin"); 

    try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!res.ok) throw new Error("Gagal upload");
        const data = await res.json();
        if (data.filepath) {
            setFormData(prev => ({ ...prev, proofFile: data.filepath })); 
            toast.success("File terupload", { description: "Bukti lampiran berhasil diunggah." });
        }
    } catch (error) {
        toast.error("Gagal Upload");
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
        toast.warning("Data Belum Lengkap");
        return;
    }
    setIsSubmitting(true);
    try {
        const res = await fetch("/api/izin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Gagal");
        setFormData({ date: "", reason: "", proofFile: "" }); 
        router.refresh(); 
        toast.success("Berhasil dikirim");
    } catch (error: any) {
        toast.error("Gagal");
    } finally {
        setIsSubmitting(false);
    }
  };

  const sidebarMenu = (
    <div className="flex flex-col h-full bg-[#EAE7DD] dark:bg-[#0c0a09] border-r border-[#d6d3c9] dark:border-[#1c1917] transition-colors duration-300">
        <div className="h-16 flex items-center gap-3 px-6 bg-[#99775C] dark:bg-[#271c19] text-white border-b border-[#8a6b52] dark:border-[#3f2e26] transition-colors duration-300">
             <div className={`p-1.5 bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-180"}`}>
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg tracking-tight">SIP-MAGANG</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Riwayat Presensi
            </Link>
            
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 bg-[#99775C] dark:bg-[#3f2e26] text-white rounded-xl font-bold transition-all shadow-md">
                <FileText className="h-5 w-5" /> Pengajuan Izin
            </Link>

            <Link href="/selesai-magang" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <GraduationCap className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Selesai Magang
            </Link>

            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2 mt-6">Akun Pengguna</h4>
            
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <User className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Profil Saya
            </Link>
            
            {/* 🔥 BUTTON LOGOUT DIPERBAIKI: Klik langsung buka state modal 🔥 */}
            <button 
                onClick={() => setIsLogoutOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-all text-left mt-4 outline-none focus:ring-0 focus:border-none"
            >
                <LogOut className="h-5 w-5" /> Keluar Aplikasi
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#0c0a09] font-sans transition-colors duration-300">
      
      <nav className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button>
             <Sheet>
                <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10"><Menu className="h-6 w-6" /></Button></SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                    <SheetTitle className="hidden">Menu Navigasi</SheetTitle>
                    {sidebarMenu}
                </SheetContent>
             </Sheet>
             <h1 className="font-bold text-xl text-white">Pengajuan Izin</h1>
          </div>
          <div className="flex items-center gap-3 text-white">
            <ModeToggle />
            <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold group-hover:text-[#EAE7DD] transition-colors">{user.name}</span>
                    <span className="text-[10px] text-[#EAE7DD]/80 font-medium">Peserta Magang</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-white/20 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                    <AvatarFallback className="bg-[#5c4a3d] text-white">U</AvatarFallback>
                </Avatar>
            </Link>
          </div>
      </nav>

      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarMenu}
      </aside>

      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8 ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        {/* FORM DAN RIWAYAT TETAP SAMA */}
        <div className="flex flex-col gap-8 w-full mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Formulir Perizinan</h2>
            <Card className="border-none shadow-md bg-white dark:bg-[#1c1917]">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Tanggal Izin</Label>
                                <Input type="date" required className="rounded-xl" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bukti Lampiran</Label>
                                <Input type="file" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Alasan</Label>
                            <Textarea className="rounded-xl" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                        </div>
                        <Button type="submit" className="w-full bg-[#99775C] text-white rounded-xl">Kirim Pengajuan</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </main>

      {/* 🔥 MODAL LOGOUT MANDIRI RESPONSIF & ANTI GHOSTING 🔥 */}
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px] p-6 sm:p-8 bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl z-[99999]">
          <AlertDialogHeader className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
               </div>
               <AlertDialogTitle className="text-lg font-bold">Konfirmasi Logout</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed text-slate-500">
              Sesi Anda akan berakhir. Anda harus login kembali jika ingin mengakses sistem nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut({ callbackUrl: "/login" })} className="w-full sm:w-auto bg-red-600 rounded-xl">Ya, Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}