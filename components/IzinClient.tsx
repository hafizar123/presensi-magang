"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  History, FileText, User, Menu, LayoutDashboard, 
  Calendar, Upload, Send, Loader2, Clock, X, CheckCircle2, LogOut, GraduationCap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IzinClientProps {
  user: any;
  requests: any[];
}

export default function IzinClient({ user, requests }: IzinClientProps) {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({ date: "", reason: "", proofFile: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStartAnimation(true);
  }, []);

  // --- HELPER FIX URL ---
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
        } else {
            throw new Error("Respon server tidak valid");
        }

    } catch (error) {
        console.error(error);
        toast.error("Gagal Upload", { description: "Coba lagi atau gunakan file lain." });
        if (fileInputRef.current) fileInputRef.current.value = ""; 
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.reason) {
        toast.warning("Data Belum Lengkap", { description: "Tanggal dan alasan wajib diisi." });
        return;
    }

    setIsSubmitting(true);
    try {
        const res = await fetch("/api/izin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal mengajukan izin");
        
        setFormData({ date: "", reason: "", proofFile: "" }); 
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        router.refresh(); 
        toast.success("Berhasil", { description: "Pengajuan izin berhasil dikirim." });
    } catch (error: any) {
        toast.error("Gagal", { description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
      setFormData(prev => ({ ...prev, proofFile: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const SidebarContent = () => (
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
            
            <LogoutModal>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-all text-left mt-4">
                    <LogOut className="h-5 w-5" /> Keluar Aplikasi
                </button>
            </LogoutModal>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#0c0a09] font-sans transition-colors duration-300">
      
      <nav 
        className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm
        ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`} 
      >
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white">
                <Menu className="h-6 w-6" />
             </Button>

             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                    <SheetTitle className="hidden">Menu Navigasi</SheetTitle>
                    <SidebarContent />
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
                <div className={`transition-all duration-1000 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
                    <Avatar className="h-9 w-9 border-2 border-white/20 group-hover:scale-105 transition-transform">
                        <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                        <AvatarFallback className="bg-[#5c4a3d] text-white">U</AvatarFallback>
                    </Avatar>
                </div>
            </Link>
          </div>
      </nav>

      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      <main 
        className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8
        ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}
      >
        <div className="flex flex-col gap-8 w-full mx-auto">
            <div className={`w-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Formulir Perizinan</h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">Silakan isi form di bawah ini untuk mengajukan izin.</p>
                </div>

                <Card className="border-none shadow-md bg-white dark:bg-[#1c1917] w-full overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-[#292524]">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-[#EAE7DD]">
                            <div className="p-2 bg-[#99775C]/10 rounded-lg text-[#99775C] dark:text-[#d6bba0]">
                                <FileText className="h-5 w-5" />
                            </div>
                            Buat Pengajuan Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Tanggal Izin</Label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                                        <Input id="date" type="date" required className="pl-10 h-11 focus:ring-[#99775C]/20 transition-all rounded-xl" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Bukti Lampiran (Opsional)</Label>
                                    {!formData.proofFile ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                border border-dashed rounded-xl h-11 flex items-center px-4 gap-2 cursor-pointer transition-all duration-200
                                                active:scale-[0.98] active:bg-slate-100
                                                ${isUploading ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" : "border-slate-300 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524] hover:border-[#99775C] text-slate-500"}
                                            `}
                                        >
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-yellow-600" /> : <Upload className="h-4 w-4" />}
                                            <span className="text-xs">{isUploading ? "Mengupload..." : "Klik untuk upload file (Max 2MB)"}</span>
                                        </div>
                                    ) : (
                                        <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-xl h-11 flex items-center justify-between px-4 text-green-700 dark:text-green-400 animate-in fade-in zoom-in-95">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-xs font-medium">File Terlampir</span>
                                            </div>
                                            <button type="button" onClick={handleRemoveFile} className="hover:text-red-500 transition-colors p-1 hover:bg-red-100 rounded-full"><X className="h-4 w-4" /></button>
                                        </div>
                                    )}
                                    <Input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} disabled={isUploading} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Alasan / Keterangan</Label>
                                <Textarea id="reason" placeholder="Jelaskan alasan izin secara singkat..." className="min-h-[120px] resize-none rounded-xl focus:ring-[#99775C]/20 transition-all" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                            </div>

                            <Button type="submit" className="w-full bg-[#99775C] dark:bg-[#3f2e26] hover:bg-[#7a5e48] text-white h-12 text-base font-semibold rounded-xl shadow-lg shadow-[#99775C]/20 active:scale-[0.98] transition-all" disabled={isSubmitting || isUploading}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Mengirim...</> : <><Send className="mr-2 h-4 w-4" /> Kirim Pengajuan</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full">
                <h3 className="font-bold text-slate-700 dark:text-[#EAE7DD] px-1 mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Riwayat Pengajuan Saya
                </h3>
                <div className="flex flex-col gap-3">
                    {requests.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-200 dark:border-[#292524] rounded-2xl text-slate-400 bg-white dark:bg-[#1c1917]">
                            <p className="text-sm">Belum ada riwayat pengajuan.</p>
                        </div>
                    ) : (
                        requests.map((req, index) => (
                            <Card key={req.id} className="shadow-sm border-slate-100 dark:border-[#292524] bg-white dark:bg-[#1c1917] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] relative active:scale-[0.99] animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-[#99775C]/10 text-[#99775C] dark:bg-[#99775C]/20 dark:text-[#EAE7DD] flex flex-col items-center justify-center font-bold border border-[#99775C]/10 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-[10px] uppercase">{new Date(req.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                            <span className="text-2xl leading-none">{new Date(req.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-[#EAE7DD] text-lg hover:text-[#99775C] dark:hover:text-[#d6bba0] transition-colors capitalize">
                                                {new Date(req.date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                {req.status === "PENDING" && <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Menunggu Konfirmasi</Badge>}
                                                {req.status === "APPROVED" && <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Disetujui</Badge>}
                                                {req.status === "REJECTED" && <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Ditolak</Badge>}
                                                
                                                {/* LINK FIX DISINI JUGA */}
                                                {req.proofFile && <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 dark:hover:bg-[#292524] active:scale-95 transition-transform" onClick={() => window.open(getFileUrl(req.proofFile), '_blank')}>Lihat Bukti 📎</Badge>}
                                            
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-1 flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 dark:text-gray-400 italic truncate max-w-md">"{req.reason}"</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                            <Clock className="h-3 w-3" />
                                            <span>Diajukan pada {new Date(req.createdAt).toLocaleDateString("id-ID")}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}