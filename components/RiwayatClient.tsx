"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as XLSX from "xlsx";
import { 
  LayoutDashboard, History, FileText, User, LogOut, Menu, 
  CalendarDays, Clock, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownLeft, Search, Filter, 
  FileSpreadsheet // GANTI ICON DOWNLOAD JADI INI
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RiwayatClientProps {
  user: any;
  logs: any[];
}

export default function RiwayatClient({ user, logs }: RiwayatClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // STATE FILTER
  const [searchDate, setSearchDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  // --- LOGIC FILTERING ---
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    const dateString = logDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const matchesSearch = dateString.toLowerCase().includes(searchDate.toLowerCase());
    const matchesMonth = selectedMonth === "ALL" || (logDate.getMonth() + 1).toString() === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  // --- LOGIC EXPORT EXCEL ---
  const handleExportExcel = () => {
    const dataToExport = filteredLogs.map((log, index) => ({
      No: index + 1,
      Hari: new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long' }),
      Tanggal: new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      "Jam Masuk": `${log.time} WIB`,
      "Jam Pulang": log.timeOut ? `${log.timeOut} WIB` : "Belum Absen",
      Status: log.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Presensi");
    const max_width = dataToExport.reduce((w, r) => Math.max(w, r.Tanggal.length), 10);
    worksheet["!cols"] = [ { wch: 5 }, { wch: 10 }, { wch: max_width }, { wch: 15 }, { wch: 15 }, { wch: 15 } ];
    XLSX.writeFile(workbook, `Riwayat_Presensi_${user.name}.xlsx`);
  };

  // --- SIDEBAR ---
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
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group"><LayoutDashboard className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Dashboard</Link>
            
            {/* ACTIVE STATE */}
            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 bg-[#99775C] dark:bg-[#3f2e26] text-white rounded-xl font-bold shadow-md"><History className="h-5 w-5" /> Riwayat Presensi</Link>
            
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group"><FileText className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Pengajuan Izin</Link>
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2 mt-6">Akun Pengguna</h4>
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group"><User className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Profil Saya</Link>
            <LogoutModal><button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-all text-left mt-4"><LogOut className="h-5 w-5" /> Keluar Aplikasi</button></LogoutModal>
        </div>
    </div>
  );

  // COMPONENT INPUT FILTER
  const FilterControls = () => (
    <div className="flex gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Cari tanggal..." 
                className="pl-9 bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] h-10"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
            />
        </div>
        <div className="w-[140px]">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] h-10">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Bulan" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => (
                        <SelectItem key={i} value={(i+1).toString()}>{m}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#0c0a09] font-sans transition-colors duration-300">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button>
             <Sheet>
                <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button></SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] border-none bg-transparent shadow-none"><SidebarContent /></SheetContent>
             </Sheet>
             <h1 className="font-bold text-xl text-white">Riwayat Presensi</h1>
          </div>
          <div className="flex items-center gap-3 text-white">
            <ModeToggle />
            <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end"><span className="text-sm font-bold group-hover:text-[#EAE7DD] transition-colors">{user.name}</span><span className="text-[10px] text-[#EAE7DD]/80 font-medium">Peserta Magang</span></div>
                <Avatar className="h-9 w-9 border-2 border-white/20 group-hover:scale-105 transition-transform"><AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} /><AvatarFallback className="bg-[#5c4a3d] text-white">U</AvatarFallback></Avatar>
            </Link>
          </div>
      </nav>

      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}><SidebarContent /></aside>

      {/* MAIN CONTENT */}
      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        
        {/* WRAPPER TABS */}
        <Tabs defaultValue="in" className="w-full space-y-6">
            
            {/* 1. HEADER HALAMAN + TOMBOL EXPORT (STYLE ADMIN REKAP) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Log Aktivitas</h2>
                    <p className="text-slate-500 dark:text-gray-400">Catatan kehadiran masuk dan pulang magang Anda.</p>
                </div>

                {/* TOMBOL EXPORT EXCEL (UPDATED STYLE) */}
                <Button 
                    onClick={handleExportExcel} 
                    className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm rounded-xl font-bold active:scale-95"
                >
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                </Button>
            </div>

            {/* 2. TAB NAVIGATION (FULL WIDTH & CENTERED) */}
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-[#1c1917] p-1 rounded-xl h-auto border dark:border-[#292524]">
                <TabsTrigger value="in" className="py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all flex items-center justify-center gap-2">
                    <ArrowDownLeft className="h-4 w-4" /> Presensi Masuk
                </TabsTrigger>
                <TabsTrigger value="out" className="py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all flex items-center justify-center gap-2">
                    <ArrowUpRight className="h-4 w-4" /> Presensi Pulang
                </TabsTrigger>
            </TabsList>

            {/* 3. CONTENT TAB (Tabel) */}
            
            {/* TAB: MASUK */}
            <TabsContent value="in" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="border-none shadow-md bg-white dark:bg-[#1c1917] overflow-hidden">
                    {/* CARD HEADER: JUDUL KIRI, SEARCH KANAN */}
                    <CardHeader className="border-b border-slate-100 dark:border-[#292524] py-4 bg-transparent">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-[#EAE7DD]">
                                <Clock className="h-5 w-5 text-green-600" /> Riwayat Masuk
                            </CardTitle>
                            {/* Filter Masuk Sini */}
                            <FilterControls />
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-[#99775C]">
                                <TableRow className="hover:bg-[#99775C] border-none">
                                    <TableHead className="w-[50px] text-center font-bold text-white pl-4">No</TableHead>
                                    <TableHead className="font-bold text-white">Hari & Tanggal</TableHead>
                                    <TableHead className="font-bold text-white">Jam Masuk</TableHead>
                                    <TableHead className="text-right font-bold text-white pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                            {logs.length === 0 ? "Belum ada data." : "Data tidak ditemukan."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log, i) => (
                                        <TableRow key={log.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524]">
                                            <TableCell className="text-center font-medium text-slate-500 pl-4">{i + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-[#292524] rounded-lg">
                                                        <CalendarDays className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-[#EAE7DD]">{new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long' })}</div>
                                                        <div className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono font-medium text-slate-700 dark:text-slate-300">{log.time} WIB</div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {log.status === "HADIR" && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Tepat Waktu</Badge>}
                                                {log.status === "TELAT" && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">Terlambat</Badge>}
                                                {log.status === "IZIN" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Izin</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB: PULANG */}
            <TabsContent value="out" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="border-none shadow-md bg-white dark:bg-[#1c1917] overflow-hidden">
                    {/* CARD HEADER: JUDUL KIRI, SEARCH KANAN */}
                    <CardHeader className="border-b border-slate-100 dark:border-[#292524] py-4 bg-transparent">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-slate-800 dark:text-[#EAE7DD]">
                                <LogOut className="h-5 w-5 text-orange-600" /> Riwayat Pulang
                            </CardTitle>
                            {/* Filter Masuk Sini Juga */}
                            <FilterControls />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-[#99775C]">
                                <TableRow className="hover:bg-[#99775C] border-none">
                                    <TableHead className="w-[50px] text-center font-bold text-white pl-4">No</TableHead>
                                    <TableHead className="font-bold text-white">Hari & Tanggal</TableHead>
                                    <TableHead className="font-bold text-white">Jam Pulang</TableHead>
                                    <TableHead className="text-right font-bold text-white pr-6">Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                            {logs.length === 0 ? "Belum ada data." : "Data tidak ditemukan."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log, i) => (
                                        <TableRow key={log.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524]">
                                            <TableCell className="text-center font-medium text-slate-500 pl-4">{i + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-[#292524] rounded-lg">
                                                        <CalendarDays className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-[#EAE7DD]">{new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long' })}</div>
                                                        <div className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.timeOut ? (
                                                    <div className="font-mono font-medium text-slate-700 dark:text-slate-300">{log.timeOut} WIB</div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {log.status === "IZIN" ? (
                                                    <Badge variant="outline" className="text-blue-500 border-blue-200">Izin</Badge>
                                                ) : log.timeOut ? (
                                                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">Selesai</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500 border-slate-200">Belum Pulang</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>

      </main>
    </div>
  );
}