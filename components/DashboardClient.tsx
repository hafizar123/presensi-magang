"use client";

import { useState } from "react";
import { 
  LogOut, MapPin, Bell, History, FileText, Clock, 
  CheckCircle2, AlertCircle, Briefcase, User, Menu, 
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Components
import RealtimeClock from "@/components/RealtimeClock";
import AttendanceButton from "@/components/AttendanceButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
             <Image src="/logo-disdikpora.png" width={32} height={32} alt="Logo" />
             <span className="font-bold text-lg text-[#1a4d2e] dark:text-green-400 tracking-tight">Dinas DIKPORA</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-[#1a4d2e] dark:text-green-400 rounded-xl font-bold transition-all shadow-sm border border-green-100 dark:border-green-800/50">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#1a4d2e] dark:hover:text-green-400 rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 group-hover:text-[#1a4d2e] dark:group-hover:text-green-400" /> Riwayat Presensi
            </Link>
            
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#1a4d2e] dark:hover:text-green-400 rounded-xl font-medium transition-all group">
                <FileText className="h-5 w-5 group-hover:text-[#1a4d2e] dark:group-hover:text-green-400" /> Pengajuan Izin
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
                Dashboard 
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

      {/* SIDEBAR DESKTOP */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 ease-in-out hidden md:block
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main 
        className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8
            ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}
        `}
      >
        
        {/* HERO PANEL */}
        <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-green-900/20 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a4d2e] via-[#145d3e] to-[#0f3d24]"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                <div className="text-center md:text-left space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-green-100 border border-white/10 backdrop-blur-md">
                        <MapPin className="h-3 w-3" />
                        <span>Disdikpora D.I. Yogyakarta</span>
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">
                            {greeting}, <span className="text-yellow-400">{user.name.split(" ")[0]}</span>
                        </h2>
                        <p className="text-green-100/80 text-lg font-light">
                            Jangan lupa presensi sebelum bekerja.
                        </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border ${statusColor}`}>
                        <StatusIcon className="h-5 w-5" />
                        <span className="font-semibold">{statusText}</span>
                    </div>
                </div>

                {/* --- BAGIAN INI YANG DIPERBAIKI (Flex Center) --- */}
                <div className="flex flex-col items-center gap-6 bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm text-white min-w-[300px]">
                     <div className="scale-125 origin-center text-white">
                        <RealtimeClock />
                     </div>
                     {/* Tambahin flex justify-center biar tombol di tengah */}
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
                    color="text-purple-600" 
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
                            <div className="shrink-0 w-14 h-14 bg-[#1a4d2e]/10 text-[#1a4d2e] dark:bg-green-900/20 dark:text-green-400 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider">{new Date(info.createdAt).toLocaleString('id-ID', { month: 'short' })}</span>
                                <span className="text-2xl leading-none">{new Date(info.createdAt).getDate()}</span>
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-[#1a4d2e] transition-colors">{info.title}</h4>
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