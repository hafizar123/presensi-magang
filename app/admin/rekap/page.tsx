"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Loader2,
  MapPin,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AttendanceLog = {
  id: string;
  user: { name: string; email: string; image?: string };
  date: string;
  time: string;
  status: string;
};

export default function RekapAbsensiPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rekap?date=${filterDate}`);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Gagal ambil rekap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterDate]); 

  const filteredLogs = logs.filter((log) => {
    const matchName = log.user.name.toLowerCase().includes(searchName.toLowerCase());
    // NOTE: log.status dari DB itu "TELAT", filterStatus juga harus "TELAT" biar match
    const matchStatus = filterStatus === "ALL" ? true : log.status === filterStatus;
    return matchName && matchStatus;
  });

  const handleExportExcel = () => {
    const dataToExport = filteredLogs.map((log, index) => ({
      "No": index + 1,
      "Tanggal": format(new Date(filterDate), "dd MMMM yyyy", { locale: id }),
      "Nama Peserta": log.user.name,
      "Email": log.user.email,
      "Waktu Absen": `${log.time} WIB`,
      "Status Kehadiran": log.status === "TELAT" ? "Terlambat" : log.status, // Export juga "Terlambat"
      "Keterangan Lokasi": log.status === "IZIN" ? "Izin/Sakit" : "Kantor Dinas Disdikpora"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const columnWidths = [
        { wch: 5 }, { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Harian");

    const fileName = `Rekap_Absensi_${filterDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Rekap Absensi</h1>
          <p className="text-slate-500 dark:text-gray-400">Pantau kedatangan dan kepulangan anak magang.</p>
        </div>
        
        <Button 
            onClick={handleExportExcel}
            disabled={filteredLogs.length === 0}
            className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm rounded-xl font-bold active:scale-95"
        >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden rounded-2xl">
        
        {/* HEADER TOOLBAR */}
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-[#292524] bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* KIRI: DATE PICKER */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#99775C]" />
                        <Input 
                            type="date"
                            className="pl-10 w-full md:w-[180px] bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] text-slate-900 dark:text-[#EAE7DD] rounded-xl font-medium focus-visible:ring-[#99775C]"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* KANAN: FILTER & SEARCH */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    
                    {/* 1. FILTER STATUS (FIX: Value "TELAT", Teks "Terlambat") */}
                    <div className="w-full sm:w-[160px] shrink-0">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-10 w-full bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] rounded-xl text-sm font-medium focus:ring-[#99775C]">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                                    <Filter className="h-3.5 w-3.5 shrink-0" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524]">
                                <SelectItem value="ALL">Semua</SelectItem>
                                <SelectItem value="HADIR">Hadir</SelectItem>
                                
                                {/* PERHATIKAN INI BRE: value="TELAT" tapi teksnya "Terlambat" */}
                                <SelectItem value="TELAT">Terlambat</SelectItem>
                                
                                <SelectItem value="IZIN">Izin/Sakit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 2. SEARCH BAR */}
                    <div className="relative w-full sm:w-[250px] shrink-0 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                        <Input 
                            placeholder="Cari nama peserta..."
                            className="pl-10 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] h-10 text-sm rounded-xl focus-visible:ring-[#99775C] transition-all"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>

                </div>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-[#99775C]">
                  <TableRow className="border-none hover:bg-[#99775C]">
                    <TableHead className="w-[50px] text-white font-bold text-center pl-4">No</TableHead>
                    <TableHead className="text-white font-bold min-w-[200px]">Nama Peserta</TableHead>
                    <TableHead className="text-white font-bold">Email</TableHead>
                    <TableHead className="text-white font-bold text-center">Waktu Absen</TableHead>
                    <TableHead className="text-white font-bold text-center">Status</TableHead>
                    <TableHead className="text-white font-bold text-right pr-6">Lokasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex justify-center items-center gap-2 text-slate-500">
                          <Loader2 className="animate-spin h-5 w-5 text-[#99775C]" /> 
                          <span className="dark:text-gray-400">Menarik data absensi...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 dark:text-gray-400">
                            Tidak ada data absen pada <span className="font-bold dark:text-[#EAE7DD]">{format(new Date(filterDate), "dd MMMM yyyy", { locale: id })}</span>
                        </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <TableRow key={log.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524] transition-colors group">
                        <TableCell className="text-center font-medium text-slate-500 pl-4">{index + 1}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-slate-200 dark:border-[#292524]">
                                    <AvatarImage src={log.user.image} />
                                    <AvatarFallback className="bg-[#99775C] text-white text-xs">{log.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-800 dark:text-[#EAE7DD]">{log.user.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {log.user.email}
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="inline-flex items-center gap-2 text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-[#292524] px-3 py-1 rounded-lg border border-slate-200 dark:border-none">
                                <Clock className="h-3.5 w-3.5 text-[#99775C]" />
                                <span className="font-bold text-xs">{log.time} WIB</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            {log.status === "HADIR" && (
                                <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-200">Tepat Waktu</Badge>
                            )}
                            
                            {/* STATUS DB "TELAT" TAPI TAMPILAN "Terlambat" */}
                            {log.status === "TELAT" && (
                                <Badge className="bg-orange-100 text-orange-700 border-none hover:bg-orange-200">Terlambat</Badge>
                            )}
                            
                            {log.status === "IZIN" && (
                                <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-200">Izin / Sakit</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5 text-slate-500 dark:text-gray-500 text-xs font-medium">
                                <MapPin className="h-3.5 w-3.5 text-[#99775C]" />
                                {log.status === "IZIN" ? "-" : "Kantor Dinas"}
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-slate-400 dark:text-gray-600 text-center pt-8 border-t border-slate-100 dark:border-[#292524] mt-8">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY
      </div>
    </div>
  );
}