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

type AttendanceLog = {
  id: string;
  user: { name: string; email: string };
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
    const matchStatus = filterStatus === "ALL" ? true : log.status === filterStatus;
    return matchName && matchStatus;
  });

  const handleExportExcel = () => {
    const dataToExport = filteredLogs.map((log, index) => ({
      "No": index + 1,
      "Tanggal": format(new Date(filterDate), "dd MMMM yyyy", { locale: id }),
      "Nama Peserta": log.user.name,
      "Email": log.user.email,
      "Waktu Absen": log.time,
      "Status Kehadiran": log.status,
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Rekap Absensi</h1>
          <p className="text-slate-500 dark:text-gray-400">Pantau kedatangan dan kepulangan anak magang.</p>
        </div>
        
        {/* TOMBOL EXPORT EXCEL (STYLE BARU - SAMA KAYA RIWAYAT) */}
        <Button 
            onClick={handleExportExcel}
            disabled={filteredLogs.length === 0}
            className="bg-white border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-all shadow-sm rounded-xl font-bold active:scale-95"
        >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-[#292524] bg-transparent">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#99775C]" />
                        <Input 
                            type="date"
                            className="pl-9 w-[180px] bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#99775C]" />
                        <Input 
                            placeholder="Cari nama peserta..."
                            className="pl-9 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD] focus:ring-1 focus:ring-[#99775C]"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px] bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]">
                            <Filter className="w-3 h-3 mr-2 text-[#99775C]" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524]">
                            <SelectItem value="ALL" className="dark:text-[#EAE7DD]">Semua</SelectItem>
                            <SelectItem value="HADIR" className="dark:text-[#EAE7DD]">Hadir</SelectItem>
                            <SelectItem value="TELAT" className="dark:text-[#EAE7DD]">Telat</SelectItem>
                            <SelectItem value="IZIN" className="dark:text-[#EAE7DD]">Izin/Sakit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#99775C]">
              <TableRow className="border-none hover:bg-[#99775C]">
                <TableHead className="w-[50px] text-white font-semibold pl-6">No</TableHead>
                <TableHead className="text-white font-semibold">Nama Peserta</TableHead>
                <TableHead className="text-white font-semibold text-center">Waktu Absen</TableHead>
                <TableHead className="text-white font-semibold">Status Kehadiran</TableHead>
                <TableHead className="text-white font-semibold text-right pr-6">Lokasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500">
                      <Loader2 className="animate-spin h-5 w-5 text-[#99775C]" /> 
                      <span className="dark:text-gray-400">Menarik data absensi...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-gray-400">
                        Tidak ada data absen pada <span className="font-bold dark:text-[#EAE7DD]">{format(new Date(filterDate), "dd MMMM yyyy", { locale: id })}</span>
                    </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, index) => (
                  <TableRow key={log.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524] transition-colors">
                    <TableCell className="text-slate-500 dark:text-gray-500 pl-6 font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-[#EAE7DD]">{log.user.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{log.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2 text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-[#292524] px-3 py-1 rounded-md border border-slate-200 dark:border-none">
                            <Clock className="h-3.5 w-3.5 text-[#99775C]" />
                            <span className="font-mono font-bold text-xs">{log.time} WIB</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        {log.status === "HADIR" && (
                            <Badge className="bg-green-100 text-green-700 border-none dark:bg-green-900/30 dark:text-green-400">
                                Tepat Waktu
                            </Badge>
                        )}
                        {log.status === "TELAT" && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-none dark:bg-yellow-900/30 dark:text-yellow-400">
                                Terlambat
                            </Badge>
                        )}
                        {log.status === "IZIN" && (
                            <Badge className="bg-blue-100 text-blue-700 border-none dark:bg-blue-900/30 dark:text-blue-400">
                                Izin / Sakit
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 text-slate-500 dark:text-gray-500 text-xs italic">
                            <MapPin className="h-3 w-3 text-[#99775C]" />
                            {log.status === "IZIN" ? "-" : "Kantor Dinas"}
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-xs text-slate-400 dark:text-gray-600 text-center pt-10 border-t border-slate-100 dark:border-[#292524] mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}