"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Loader2, Send, FileText, Download, 
  Menu, LayoutDashboard, History, User, LogOut,
  Trophy, Star, ClipboardCheck, Sparkles,
  GraduationCap, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function SelesaiMagangPage() {
  const { data: session } = useSession();
  const user = session?.user || { name: "Memuat...", image: "" };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({ pekerjaan: "", deskripsi: "" });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setStartAnimation(true);
    fetch("/api/final-evaluation")
      .then((res) => res.json())
      .then((d) => {
        if (d) {
          setData({ pekerjaan: d.pekerjaan || "", deskripsi: d.deskripsi || "" });
          setStatus(d.status);
        }
      })
      .catch((err) => console.error("Error fetching evaluation:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.pekerjaan.trim() || !data.deskripsi.trim()) {
        return toast.error("Validasi Gagal", { description: "Seluruh kolom laporan wajib diisi." });
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/final-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim laporan.");
      }

      toast.success("Laporan Terkirim", { description: "Menunggu penilaian dari Admin Divisi." });
      setStatus("PENDING");
    } catch (error) {
      toast.error("Terjadi Kesalahan", { description: "Gagal mengirim laporan akhir." });
    } finally {
      setSubmitting(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#EAE7DD] dark:bg-[#0c0a09] border-r border-[#d6d3c9] dark:border-[#1c1917] transition-colors duration-300">
        <div className="h-16 flex items-center gap-3 px-6 bg-[#99775C] dark:bg-[#271c19] text-white border-b border-[#8a6b52] dark:border-[#3f2e26]">
             <div className="p-1.5 bg-white/20 rounded-lg">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg tracking-tight">SIP-MAGANG</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
            </Link>
            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 rounded-xl font-medium transition-all group">
                <History className="h-5 w-5" /> Riwayat Presensi
            </Link>
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 rounded-xl font-medium transition-all group">
                <FileText className="h-5 w-5" /> Pengajuan Izin
            </Link>
            <Link href="/selesai-magang" className="flex items-center gap-3 px-4 py-3 bg-[#99775C] dark:bg-[#3f2e26] text-white rounded-xl font-bold shadow-md">
                <GraduationCap className="h-5 w-5" /> Selesai Magang
            </Link>
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2 mt-6">Akun</h4>
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 rounded-xl font-medium transition-all group">
                <User className="h-5 w-5" /> Profil Saya
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
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}>
          <div className="flex items-center gap-4 text-white">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white transition-colors">
                <Menu className="h-6 w-6" />
             </Button>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white transition-colors">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                  <SheetTitle className="hidden">Menu Navigasi</SheetTitle>
                  {sidebarContent}
                </SheetContent>
             </Sheet>
             <h1 className="font-bold text-xl text-white">Laporan Akhir</h1>
          </div>
          <div className="flex items-center gap-3 text-white">
            <ModeToggle />
            <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
            <Link href="/profile" className="flex items-center gap-3 pl-1 group cursor-pointer">
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

      {/* SIDEBAR DESKTOP */}
      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>

      {/* MAIN CONTENT */}
      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        
        {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-[#99775C]">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="font-medium animate-pulse">Memuat formulir pelaporan...</p>
            </div>
        ) : (
            <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 ${startAnimation ? "opacity-100" : "opacity-0"}`}>
                
                {/* HEADER CARD */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#99775C] to-[#6d5440] p-8 md:p-10 text-white shadow-xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150">
                        <Trophy className="h-40 w-40" />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="h-3 w-3 text-yellow-300" /> Tahap Akhir Magang
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Penyelesaian Masa Magang</h2>
                        <p className="text-[#EAE7DD]/90 text-sm md:text-base leading-relaxed">
                            Selamat telah menyelesaikan masa magang Anda. Silakan lengkapi laporan akhir di bawah ini untuk proses penilaian dan penerbitan Surat Keterangan Magang resmi dari Disdikpora DIY.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* FORM SECTION */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-md bg-white dark:bg-[#1c1917] rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50 dark:border-[#292524] pb-6">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-[#99775C]/10 rounded-xl text-[#99775C]">
                                        <ClipboardCheck className="h-6 w-6" />
                                    </div>
                                    Keluaran Pekerjaan / Laporan Magang
                                </CardTitle>
                                <CardDescription>Uraikan pekerjaan atau luaran yang dihasilkan selama pelaksanaan magang.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-[#EAE7DD]">Daftar Pekerjaan Utama</Label>
                                        <Textarea 
                                            placeholder="Deskripsikan luaran pekerjaan Anda (disarankan menggunakan poin-poin)..."
                                            value={data.pekerjaan}
                                            onChange={(e) => setData({...data, pekerjaan: e.target.value})}
                                            disabled={status === "GRADED"}
                                            className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-[#99775C]/20 focus:border-[#99775C] transition-all bg-slate-50/50 dark:bg-[#292524]/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-[#EAE7DD]">Kesan dan Pesan</Label>
                                        <Textarea 
                                            placeholder="Tuliskan kesan, pesan, dan pengalaman Anda selama magang di Instansi..."
                                            value={data.deskripsi}
                                            onChange={(e) => setData({...data, deskripsi: e.target.value})}
                                            disabled={status === "GRADED"}
                                            className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-[#99775C]/20 focus:border-[#99775C] transition-all bg-slate-50/50 dark:bg-[#292524]/50"
                                        />
                                    </div>
                                    {status !== "GRADED" && (
                                        <Button 
                                            type="submit" 
                                            disabled={submitting} 
                                            className="w-full h-14 bg-[#99775C] hover:bg-[#7a5e48] text-white rounded-2xl font-bold shadow-lg shadow-[#99775C]/20 active:scale-95 transition-all"
                                        >
                                            {submitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                                            {status === "PENDING" ? "Perbarui Laporan" : "Kirim Laporan"}
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* STATUS SIDEBAR */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-md bg-white dark:bg-[#1c1917] rounded-3xl overflow-hidden text-center p-8">
                            <CardTitle className="text-lg mb-6 text-slate-700 dark:text-[#EAE7DD]">Status Pemberkasan</CardTitle>
                            <CardContent className="space-y-6">
                                {status === "GRADED" ? (
                                    <div className="animate-in zoom-in-95 duration-500">
                                        <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-[#1c1917] shadow-lg">
                                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Penilaian Selesai</h3>
                                        <p className="text-sm text-slate-500 mt-2 px-2 leading-relaxed">
                                            Laporan Anda telah dinilai oleh Admin Divisi. Surat Keterangan Magang resmi sedang diproses oleh <b>Sub Bagian Kepegawaian</b>. Silakan hubungi admin terkait untuk proses pengambilan berkas.
                                        </p>
                                    </div>
                                ) : status === "PENDING" ? (
                                    <div className="py-4">
                                        <div className="h-24 w-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-[#1c1917] shadow-lg animate-pulse">
                                            <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-[#EAE7DD]">Proses Verifikasi</h3>
                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed px-4">Admin terkait sedang meninjau pelaporan pekerjaan Anda untuk diberikan penilaian akhir.</p>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <div className="h-24 w-24 bg-slate-100 dark:bg-[#292524] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-[#1c1917] shadow-sm">
                                            <FileText className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-400">Belum Mengajukan</h3>
                                        <p className="text-xs text-slate-400 mt-2 px-2">Kirim laporan terlebih dahulu agar Admin Divisi dapat melakukan penilaian.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="p-6 bg-[#99775C]/5 border border-[#99775C]/10 rounded-3xl">
                             <h4 className="text-sm font-bold text-[#99775C] flex items-center gap-2 mb-3 uppercase tracking-widest">
                                <Sparkles className="h-4 w-4" /> Informasi Penilaian
                             </h4>
                             <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-loose">
                                Pengisian data luaran pekerjaan dengan detail akan membantu proses penilaian. Admin akan menilai dari 5 aspek: Sikap & Etika, Kedisiplinan, Tanggung Jawab, Kerjasama Tim, serta Inisiatif & Inovasi.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}