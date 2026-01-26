"use client";

import { useState } from "react";
import { 
  LogOut, Bell, History, FileText, 
  User, Menu, LayoutDashboard, Calendar, Filter, Download
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RiwayatClientProps {
  user: any;
  logs: any[];
}

export default function RiwayatClient({ user, logs }: RiwayatClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterBulan, setFilterBulan] = useState<string>("");

  // Filter Logic (Sederhana)
  const filteredLogs = filterBulan 
    ? logs.filter(log => new Date(log.createdAt).getMonth().toString() === filterBulan)
    : logs;

  // --- SIDEBAR (MAROON) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#450a0a] dark:bg-[#2a0505] border-r border-[#5c0e0e] dark:border-[#3d0808] text-white">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#5c0e0e] dark:border-[#3d0808]">
             <div className="p-1.5 bg-white rounded-lg">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg text-white tracking-tight">Dinas DIKPORA</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-red-200/50 uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Dashboard
            </Link>

            {/* Active State: Riwayat */}
            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-bold transition-all shadow-lg border border-white/10 backdrop-blur-sm">
                <History className="h-5 w-5" /> Riwayat Presensi
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
      
      {/* NAVBAR (PUTIH) */}
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
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                    <SidebarContent />
                </SheetContent>
             </Sheet>
             <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Riwayat Presensi</h1>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>
            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#450a0a] transition-colors">{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Peserta Magang</span>
                </div>
                <Avatar className="h-9 w-9 border border-slate-200 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                    <AvatarFallback className="bg-[#450a0a] text-white">U</AvatarFallback>
                </Avatar>
            </Link>
          </div>
      </nav>

      {/* SIDEBAR DESKTOP */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#450a0a] shadow-2xl transition-transform duration-300 ease-in-out hidden md:block
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
        {/* FILTERS HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daftar Kehadiran</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Pantau catatan kehadiran magangmu disini.
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <Select onValueChange={setFilterBulan}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Filter className="w-4 h-4 mr-2 text-slate-500" />
                        <SelectValue placeholder="Filter Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Januari</SelectItem>
                        <SelectItem value="1">Februari</SelectItem>
                        <SelectItem value="2">Maret</SelectItem>
                        <SelectItem value="3">April</SelectItem>
                        <SelectItem value="4">Mei</SelectItem>
                        <SelectItem value="5">Juni</SelectItem>
                        <SelectItem value="6">Juli</SelectItem>
                        <SelectItem value="7">Agustus</SelectItem>
                        <SelectItem value="8">September</SelectItem>
                        <SelectItem value="9">Oktober</SelectItem>
                        <SelectItem value="10">November</SelectItem>
                        <SelectItem value="11">Desember</SelectItem>
                    </SelectContent>
                </Select>
                
                <Button variant="outline" className="border-slate-200 dark:border-slate-800 text-[#450a0a] hover:bg-red-50 hover:text-[#5c0e0e]">
                    <Download className="w-4 h-4 mr-2" /> Export
                </Button>
            </div>
        </div>

        {/* LIST PRESENSI */}
        <div className="space-y-3">
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400">Belum ada data presensi.</p>
                </div>
            ) : (
                filteredLogs.map((log) => (
                    <Card key={log.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 group">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            
                            {/* Left: Date Icon (Merah Maroon) */}
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-[#450a0a]/5 text-[#450a0a] dark:bg-red-900/20 dark:text-red-400 flex flex-col items-center justify-center font-bold border border-[#450a0a]/10">
                                    <span className="text-[10px] uppercase">{new Date(log.createdAt).toLocaleString('id-ID', { weekday: 'short' })}</span>
                                    <span className="text-2xl leading-none">{new Date(log.createdAt).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-[#450a0a] transition-colors">
                                        {new Date(log.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Status Badge (Warna Logika Tetap) */}
                            <div>
                                {log.status === "HADIR" && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-4 py-1.5">Hadir Tepat Waktu</Badge>}
                                {log.status === "TELAT" && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-4 py-1.5">Terlambat</Badge>}
                                {log.status === "IZIN" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-4 py-1.5">Izin / Sakit</Badge>}
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