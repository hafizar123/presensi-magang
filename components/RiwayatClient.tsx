"use client";

import { useState } from "react";
import { 
  LogOut, Bell, History, FileText, Clock, 
  User, Menu, LayoutDashboard, Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface RiwayatClientProps {
  user: any;
  logs: any[];
}

export default function RiwayatClient({ user, logs }: RiwayatClientProps) {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    const dateStr = new Date(log.date).toLocaleDateString("id-ID", {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).toLowerCase();
    return dateStr.includes(searchTerm.toLowerCase());
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
             <Image src="/logo-disdikpora.png" width={32} height={32} alt="Logo" />
             <span className="font-bold text-lg text-[#1a4d2e] dark:text-green-400 tracking-tight">Dinas DIKPORA</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#1a4d2e] dark:hover:text-green-400 rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 group-hover:text-[#1a4d2e] dark:group-hover:text-green-400" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-[#1a4d2e] dark:text-green-400 rounded-xl font-bold transition-all shadow-sm border border-green-100 dark:border-green-800/50">
                <History className="h-5 w-5" /> Riwayat Presensi
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
                Riwayat Presensi 
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Jurnal Aktivitas</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Rekapitulasi kehadiran kamu selama magang.
                </p>
            </div>
            
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Cari tanggal..." 
                    className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-[#1a4d2e]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex flex-col gap-3">
            {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400">
                    <Search className="h-10 w-10 mb-3 opacity-20" />
                    <p>Data tidak ditemukan.</p>
                </div>
            ) : (
                filteredLogs.map((log) => (
                    <Card key={log.id} className="shadow-sm border-slate-100 dark:border-slate-800 hover:shadow-md transition-all hover:border-green-100 dark:hover:border-green-900/30 group bg-white dark:bg-slate-900">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 text-[#1a4d2e] dark:text-green-400 flex flex-col items-center justify-center font-bold border border-green-100 dark:border-green-900/50 shrink-0">
                                    <span className="text-[10px] uppercase">{new Date(log.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                    <span className="text-2xl leading-none">{new Date(log.date).getDate()}</span>
                                </div>
                                <div>
                                    {/* FIX DATE FORMAT: Jumat, 23 Januari */}
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-[#1a4d2e] transition-colors capitalize">
                                        {new Date(log.date).toLocaleDateString("id-ID", { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long' 
                                        })}
                                    </h4>
                                    
                                    <div className="flex items-center gap-2 mt-1">
                                        {log.status === "HADIR" && <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Hadir</Badge>}
                                        {log.status === "TELAT" && <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Terlambat</Badge>}
                                        {log.status === "IZIN" && <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Izin</Badge>}
                                        {log.status === "ALPHA" && <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Alpha</Badge>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800">
                                        <Clock className="h-4 w-4 text-[#1a4d2e] dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Jam Masuk</p>
                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">
                                            {/* FIX JAM MASUK: Pake log.time yang string */}
                                            {log.time ? `${log.time} WIB` : "--:--"} 
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ))
            )}
        </div>

      </main>
    </div>
  );
}