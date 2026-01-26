"use client";

import { useState } from "react";
import { 
  LogOut, Bell, History, FileText, 
  User, Menu, LayoutDashboard, Calendar, Filter, Download
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RiwayatClientProps {
  user: any;
  logs: any[];
}

export default function RiwayatClient({ user, logs }: RiwayatClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterBulan, setFilterBulan] = useState<string>("");

  const filteredLogs = filterBulan 
    ? logs.filter(log => new Date(log.createdAt).getMonth().toString() === filterBulan)
    : logs;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#EAE7DD] dark:bg-[#0c0a09] border-r border-[#d6d3c9] dark:border-[#1c1917] transition-colors duration-300">
        <div className="h-16 flex items-center gap-3 px-6 bg-[#99775C] dark:bg-[#271c19] text-white border-b border-[#8a6b52] dark:border-[#3f2e26]">
             <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg tracking-tight">SIP-MAGANG</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Dashboard
            </Link>

            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 bg-[#99775C] dark:bg-[#3f2e26] text-white rounded-xl font-bold transition-all shadow-md">
                <History className="h-5 w-5" /> Riwayat Presensi
            </Link>
            
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <FileText className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Pengajuan Izin
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
                    <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                    <SidebarContent />
                </SheetContent>
             </Sheet>
             <h1 className="font-bold text-xl text-white">Riwayat Presensi</h1>
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
        <SidebarContent />
      </aside>

      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8 ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Daftar Kehadiran</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-1">Pantau catatan kehadiran magangmu disini.</p>
            </div>
            
            <div className="flex items-center gap-2">
                <Select onValueChange={setFilterBulan}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] dark:text-[#EAE7DD]">
                        <Filter className="w-4 h-4 mr-2 text-slate-500 dark:text-gray-400" />
                        <SelectValue placeholder="Filter Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Januari</SelectItem>
                        <SelectItem value="1">Februari</SelectItem>
                        <SelectItem value="2">Maret</SelectItem>
                    </SelectContent>
                </Select>
                
                <Button variant="outline" className="border-slate-200 dark:border-[#292524] text-[#99775C] dark:text-[#d6bba0] hover:bg-[#EAE7DD] dark:hover:bg-[#292524]">
                    <Download className="w-4 h-4 mr-2" /> Export
                </Button>
            </div>
        </div>

        <div className="space-y-3">
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#1c1917] rounded-2xl border border-dashed border-slate-200 dark:border-[#292524]">
                    <p className="text-slate-400">Belum ada data presensi.</p>
                </div>
            ) : (
                filteredLogs.map((log) => (
                    <Card key={log.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1c1917] group">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-[#99775C]/10 text-[#99775C] dark:bg-[#99775C]/20 dark:text-[#EAE7DD] flex flex-col items-center justify-center font-bold border border-[#99775C]/10">
                                    <span className="text-[10px] uppercase">{new Date(log.createdAt).toLocaleString('id-ID', { weekday: 'short' })}</span>
                                    <span className="text-2xl leading-none">{new Date(log.createdAt).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-[#EAE7DD] text-lg group-hover:text-[#99775C] dark:group-hover:text-[#d6bba0] transition-colors">
                                        {new Date(log.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-500 font-medium mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                </div>
                            </div>
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