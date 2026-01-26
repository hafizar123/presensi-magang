"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  History, FileText, User, Menu, LayoutDashboard, 
  Calendar, Upload, Send, Loader2, Clock, X, CheckCircle2, AlertCircle, LogOut 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Jangan lupa import Image buat logo
import { toast } from "sonner"; 

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({ date: "", reason: "", proofFile: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGIC UPLOAD (SAMA KAYA SEBELUMNYA)
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

    try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!res.ok) throw new Error("Gagal upload");
        const data = await res.json();
        setFormData(prev => ({ ...prev, proofFile: data.url })); 
        toast.success("File terupload", { description: "Bukti lampiran berhasil diunggah." });
    } catch (error) {
        toast.error("Gagal Upload", { description: "Coba lagi atau gunakan file lain." });
        if (fileInputRef.current) fileInputRef.current.value = ""; 
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // --- SIDEBAR DENGAN DARK MODE (FIXED) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#EAE7DD] dark:bg-[#0c0a09] border-r border-[#d6d3c9] dark:border-[#1c1917] transition-colors duration-300">
        
        {/* HEADER: Coklat Sorrell / Espresso */}
        <div className="h-16 flex items-center gap-3 px-6 bg-[#99775C] dark:bg-[#271c19] text-white border-b border-[#8a6b52] dark:border-[#3f2e26]">
             <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg tracking-tight">SIP-MAGANG</span>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Riwayat Presensi
            </Link>
            
            {/* Active State (Izin): Coklat / Espresso */}
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 bg-[#99775C] dark:bg-[#3f2e26] text-white rounded-xl font-bold transition-all shadow-md">
                <FileText className="h-5 w-5" /> Pengajuan Izin
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
      
      {/* NAVBAR DENGAN DARK MODE (FIXED) */}
      <nav 
        className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm w-full lg:w-[calc(100%-280px)] lg:left-[280px]`}
      >
          <div className="flex items-center gap-4">
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] border-none bg-transparent shadow-none">
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
                <Avatar className="h-9 w-9 border-2 border-white/20 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                    <AvatarFallback className="bg-[#5c4a3d] text-white">U</AvatarFallback>
                </Avatar>
            </Link>
          </div>
      </nav>

      {/* SIDEBAR DESKTOP */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl hidden lg:block border-r border-[#d6d3c9] dark:border-[#1c1917]">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main className="pt-24 px-4 md:px-8 pb-12 lg:ml-[280px]">
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
            
            {/* FORM */}
            <div className="w-full">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Formulir Perizinan</h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">Silakan isi form di bawah ini untuk mengajukan izin.</p>
                </div>

                <Card className="border-none shadow-md bg-white dark:bg-[#1c1917] w-full">
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
                                {/* INPUT TANGGAL */}
                                <div className="space-y-2">
                                    <Label htmlFor="date">Tanggal Izin</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input id="date" type="date" required className="pl-10 h-11" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                    </div>
                                </div>

                                {/* INPUT FILE */}
                                <div className="space-y-2">
                                    <Label>Bukti Lampiran (Opsional)</Label>
                                    
                                    {!formData.proofFile ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border border-dashed ${isUploading ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" : "border-slate-300 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524]"} rounded-md h-11 flex items-center px-4 gap-2 text-slate-500 cursor-pointer transition-colors`}
                                        >
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-yellow-600" /> : <Upload className="h-4 w-4" />}
                                            <span className="text-xs">{isUploading ? "Mengupload..." : "Klik untuk upload file (Max 2MB)"}</span>
                                        </div>
                                    ) : (
                                        <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-md h-11 flex items-center justify-between px-4 text-green-700 dark:text-green-400">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-xs font-medium">File Terlampir</span>
                                            </div>
                                            <button type="button" onClick={handleRemoveFile} className="hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                                        </div>
                                    )}
                                    
                                    <Input 
                                        ref={fileInputRef} 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Alasan / Keterangan</Label>
                                <Textarea id="reason" placeholder="Jelaskan alasan izin secara singkat..." className="min-h-[120px] resize-none" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                            </div>

                            <Button type="submit" className="w-full bg-[#99775C] dark:bg-[#3f2e26] hover:bg-[#7a5e48] text-white h-12 text-base font-semibold rounded-xl shadow-lg shadow-[#99775C]/20" disabled={isSubmitting || isUploading}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Mengirim...</> : <><Send className="mr-2 h-4 w-4" /> Kirim Pengajuan</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* RIWAYAT */}
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
                        requests.map((req) => (
                            <Card key={req.id} className="shadow-sm border-slate-100 dark:border-[#292524] hover:shadow-md transition-all bg-white dark:bg-[#1c1917]">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-[#99775C]/10 text-[#99775C] dark:bg-[#99775C]/20 dark:text-[#EAE7DD] flex flex-col items-center justify-center font-bold border border-[#99775C]/10 shrink-0">
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
                                                {req.proofFile && <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200 dark:hover:bg-[#292524]" onClick={() => window.open(req.proofFile, '_blank')}>Lihat Bukti 📎</Badge>}
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