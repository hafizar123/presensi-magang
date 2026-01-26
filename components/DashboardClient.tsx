"use client";

import { useState } from "react";
import { 
  LogOut, MapPin, Bell, History, FileText, Clock, 
  CheckCircle2, AlertCircle, User, Menu, 
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Components
import RealtimeClock from "@/components/RealtimeClock";
import AttendanceButton from "@/components/AttendanceButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// Tipe data props
interface DashboardClientProps {
  user: any;
  announcements: any[];
  todayLog: any;
  stats: {
    hadir: number;
    telat: number;
    izin: number;
    total: number;
  };
  greeting: string;
}

export default function DashboardClient({ 
  user, announcements, todayLog, stats, greeting 
}: DashboardClientProps) {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Logic Status Badge (Tetap)
  let statusText = "Belum Presensi";
  let statusColor = "bg-white/10 text-white border-white/20 backdrop-blur-md";
  let StatusIcon = Clock;
   
  if (todayLog) {
    if (todayLog.status === "HADIR") {
        statusText = "Sudah Presensi";
        statusColor = "bg-green-500/20 text-green-100 border-green-500/30 backdrop-blur-md";
        StatusIcon = CheckCircle2;
    } else if (todayLog.status === "TELAT") {
        statusText = "Terlambat";
        statusColor = "bg-orange-500/20 text-orange-100 border-orange-500/30 backdrop-blur-md";
        StatusIcon = AlertCircle;
    } else if (todayLog.status === "IZIN") {
        statusText = "Izin / Sakit";
        statusColor = "bg-blue-500/20 text-blue-100 border-blue-500/30 backdrop-blur-md";
        StatusIcon = FileText;
    }
  }

  // --- KONTEN SIDEBAR (TETAP MERAH MAROON) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#450a0a] dark:bg-[#2a0505] border-r border-[#5c0e0e] dark:border-[#3d0808] text-white">
        
        {/* HEADER SIDEBAR */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#5c0e0e] dark:border-[#3d0808]">
             <div className="p-1.5 bg-white rounded-lg">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg text-white tracking-tight">Dinas DIKPORA</span>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-red-200/50 uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-bold transition-all shadow-lg border border-white/10 backdrop-blur-sm">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Riwayat Presensi
            </Link>
            
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <FileText className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Pengajuan Izin
            </Link>

            <h4 className="text-xs font-semibold text-red-200/50 uppercase tracking-wider mb-2 px-2 mt-6">Akun Pengguna</h4>
            
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <User className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Profil Saya
            </Link>
            
            <LogoutModal>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-950/50 hover:text-red-200 rounded-xl font-medium transition-all text-left">
                    <LogOut className="h-5 w-5" /> Keluar Aplikasi
                </button>
            </LogoutModal>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-slate-950 font-sans transition-colors duration-300">
       
      {/* --- NAVBAR ATAS (PUTIH BERSIH) --- */}
      <nav 
        className={`fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}
      >
          {/* KIRI: Toggle Button + Judul */}
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
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                    <SidebarContent />
                </SheetContent>
             </Sheet>

             <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Dashboard</h1>
          </div>

          {/* KANAN: Mode & Profil (Text Gelap) */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>

            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#450a0a] transition-colors">
                        {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Peserta Magang</span>
                </div>
                <Avatar className="h-9 w-9 border border-slate-200 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                    <AvatarFallback className="bg-[#450a0a] text-white">U</AvatarFallback>
                </Avatar>
            </Link>
          </div>
      </nav>

      {/* --- SIDEBAR DESKTOP (BACKGROUND MAROON) --- */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#450a0a] shadow-2xl transition-transform duration-300 ease-in-out hidden md:block
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main 
        className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8
            ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}
        `}
      >
        
        {/* HERO PANEL (Kartu Tetap Merah Gelap biar Kalcer) */}
        <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-xl shadow-red-900/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#450a0a] via-[#5c0e0e] to-[#7f1d1d]"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                <div className="text-center md:text-left space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-red-100 border border-white/10 backdrop-blur-md">
                        <MapPin className="h-3 w-3" />
                        <span>Disdikpora D.I. Yogyakarta</span>
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">
                            {greeting}, <span className="text-red-200">{user.name.split(" ")[0]}</span>
                        </h2>
                        <p className="text-red-100/70 text-lg font-light">
                            Jangan lupa presensi sebelum bekerja.
                        </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border ${statusColor}`}>
                        <StatusIcon className="h-5 w-5" />
                        <span className="font-semibold">{statusText}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 bg-black/20 p-10 rounded-[2rem] border border-white/5 backdrop-blur-sm text-white min-w-[300px]">
                     <div className="scale-125 origin-center text-white">
                        <RealtimeClock />
                     </div>
                     <div className="w-full flex justify-center">
                        <AttendanceButton type="IN" disabled={!!todayLog} />
                     </div>
                </div>
            </div>
        </div>

        {/* STATS TILES */}
        <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 px-2">Statistik Bulan Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    label="Hadir Tepat Waktu" 
                    value={stats.hadir} 
                    icon={CheckCircle2} 
                    color="text-green-600" 
                    desc="Hari"
                />
                <StatsCard 
                    label="Terlambat" 
                    value={stats.telat} 
                    icon={Clock} 
                    color="text-orange-600" 
                    desc="Hari"
                />
                <StatsCard 
                    label="Izin / Sakit" 
                    value={stats.izin} 
                    icon={FileText} 
                    color="text-blue-600" 
                    desc="Hari"
                />
                <StatsCard 
                    label="Total Masuk" 
                    value={stats.total} 
                    icon={LayoutDashboard} 
                    color="text-[#450a0a] dark:text-red-400" 
                    desc="Akumulasi bulan ini"
                />
            </div>
        </div>

        {/* PENGUMUMAN */}
        <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4 px-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Papan Informasi
            </h3>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-sm border border-slate-100 dark:border-slate-800">
                {announcements.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Belum ada informasi terbaru.</div>
                ) : (
                    announcements.map((info) => (
                        <div key={info.id} className="group flex items-start gap-4 p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer border-b border-dashed border-slate-100 last:border-0">
                            <div className="shrink-0 w-14 h-14 bg-[#450a0a]/10 text-[#450a0a] dark:bg-red-900/20 dark:text-red-400 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider">{new Date(info.createdAt).toLocaleString('id-ID', { month: 'short' })}</span>
                                <span className="text-2xl leading-none">{new Date(info.createdAt).getDate()}</span>
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-[#450a0a] transition-colors">{info.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {info.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </main>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, desc }: any) {
    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden h-auto min-h-[140px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icon className={`w-24 h-24 ${color}`} />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent className="relative z-10 pb-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {desc}
                </p>
            </CardContent>
        </Card>
    )
}