"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOut, Bell, History, FileText, 
  User, Menu, LayoutDashboard, Calendar, Upload, Send, Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; 

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const res = await fetch("/api/izin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Gagal mengajukan izin");

        setFormData({ date: "", reason: "" }); 
        router.refresh(); 
        
        toast.success("Berhasil", {
            description: "Pengajuan izin berhasil dikirim."
        });

    } catch (error) {
        console.error(error);
        toast.error("Gagal", {
            description: "Terjadi kesalahan saat mengirim data."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
             <Image src="/logo-disdikpora.png" width={32} height={32} alt="Logo" />
             <span className="font-bold text-lg text-[#1a4d2e] dark:text-green-400 tracking-tight">SIP-MAGANG</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#1a4d2e] dark:hover:text-green-400 rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 group-hover:text-[#1a4d2e] dark:group-hover:text-green-400" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#1a4d2e] dark:hover:text-green-400 rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 group-hover:text-[#1a4d2e] dark:group-hover:text-green-400" /> Riwayat Presensi
            </Link>
            
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-[#1a4d2e] dark:text-green-400 rounded-xl font-bold transition-all shadow-sm border border-green-100 dark:border-green-800/50">
                <FileText className="h-5 w-5" /> Pengajuan Izin
            </Link>

            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-6">Akun Pengguna</h4>
            
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#1a4d2e] dark:hover:text-green-400 rounded-xl font-medium transition-all group">
                <User className="h-5 w-5 group-hover:text-[#1a4d2e] dark:group-hover:text-green-400" /> Profil Saya
            </Link>
            
            <LogoutModal>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl font-medium transition-all text-left">
                    <LogOut className="h-5 w-5" /> Keluar Aplikasi
                </button>
            </LogoutModal>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}
      >
          <div className="flex items-center gap-4">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
             >
                <Menu className="h-6 w-6" />
             </Button>

             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 text-slate-600">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px]">
                    <SidebarContent />
                </SheetContent>
             </Sheet>

             {/* Judul Halaman (Sesuaikan Teksnya per file ya! misal: Dashboard / Riwayat / dll) */}
             <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                Pengajuan Izin 
             </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Toggle (Pastiin import ModeToggle ada di atas file) */}
            <ModeToggle />
            
            {/* --- LONCENG UDAH DIHAPUS DISINI --- */}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>
            
            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1a4d2e] transition-colors">
                        {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Peserta Magang</span>
                </div>
                <Avatar className="h-9 w-9 border border-slate-200 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </Link>
          </div>
      </nav>

      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 ease-in-out hidden md:block
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      <main 
        className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8
            ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}
        `}
      >
        
        {/* CONTAINER UTAMA: FULL WIDTH */}
        <div className="flex flex-col gap-8 w-full">
            
            {/* BAGIAN 1: FORM PENGAJUAN (Full Width) */}
            <div className="w-full">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Formulir Perizinan</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Silakan isi form di bawah ini untuk mengajukan izin.
                    </p>
                </div>

                <Card className="border-none shadow-md bg-white dark:bg-slate-900 w-full">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-[#1a4d2e] dark:text-green-400">
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
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input 
                                            id="date"
                                            type="date" 
                                            required
                                            className="pl-10 h-11"
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Bukti Lampiran (Opsional)</Label>
                                    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-md h-11 flex items-center px-4 gap-2 text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <Upload className="h-4 w-4" />
                                        <span className="text-xs">Klik untuk upload file</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Alasan / Keterangan</Label>
                                <Textarea 
                                    id="reason"
                                    placeholder="Jelaskan alasan izin secara singkat..."
                                    className="min-h-[120px] resize-none"
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-[#1a4d2e] hover:bg-[#143d24] text-white h-12 text-base font-semibold rounded-xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Kirim Pengajuan
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* BAGIAN 2: RIWAYAT PENGAJUAN (Full Width & Memanjang) */}
            <div className="w-full">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 px-1 mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Riwayat Pengajuan Saya
                </h3>
                
                {/* LIST STACK VERTICAL (Memanjang) */}
                <div className="flex flex-col gap-3">
                    {requests.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 bg-white dark:bg-slate-900">
                            <p className="text-sm">Belum ada riwayat pengajuan.</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <Card key={req.id} className="shadow-sm border-slate-100 dark:border-slate-800 hover:shadow-md transition-all bg-white dark:bg-slate-900">
                                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    
                                    {/* KIRI: Tanggal & Badge Status */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-bold border border-blue-100 dark:border-blue-900/50 shrink-0">
                                            <span className="text-[10px] uppercase">{new Date(req.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                            <span className="text-2xl leading-none">{new Date(req.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg hover:text-blue-600 transition-colors capitalize">
                                                {new Date(req.date).toLocaleDateString("id-ID", { 
                                                    weekday: 'long', 
                                                    day: 'numeric', 
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </h4>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                {/* Status Badge */}
                                                {req.status === "PENDING" && <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Menunggu Konfirmasi</Badge>}
                                                {req.status === "APPROVED" && <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Disetujui</Badge>}
                                                {req.status === "REJECTED" && <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Ditolak</Badge>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* KANAN: Keterangan & Tanggal Submit */}
                                    <div className="flex flex-col sm:items-end gap-1 flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic truncate max-w-md">
                                            "{req.reason}"
                                        </p>
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