"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  Search, 
  Download, 
  Filter, 
  Loader2,
  MapPin,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx"; // <--- Import Library Excel

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  
  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default hari ini
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

  // Filter Client-Side
  const filteredLogs = logs.filter((log) => {
    const matchName = log.user.name.toLowerCase().includes(searchName.toLowerCase());
    const matchStatus = filterStatus === "ALL" ? true : log.status === filterStatus;
    return matchName && matchStatus;
  });

  // --- FUNGSI EXPORT EXCEL ---
  const handleExportExcel = () => {
    // 1. Siapin data yang mau diprint (Format biar rapi di Excel)
    const dataToExport = filteredLogs.map((log, index) => ({
      "No": index + 1,
      "Tanggal": format(new Date(filterDate), "dd MMMM yyyy", { locale: id }),
      "Nama Peserta": log.user.name,
      "Email": log.user.email,
      "Waktu Absen": log.time,
      "Status Kehadiran": log.status,
      "Keterangan Lokasi": log.status === "IZIN" ? "Izin/Sakit" : "Kantor Dinas Disdikpora"
    }));

    // 2. Bikin Worksheet (Lembar Kerja)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Atur lebar kolom (Optional, biar rapi)
    const columnWidths = [
        { wch: 5 },  // No
        { wch: 20 }, // Tanggal
        { wch: 30 }, // Nama
        { wch: 25 }, // Email
        { wch: 15 }, // Waktu
        { wch: 15 }, // Status
        { wch: 25 }  // Lokasi
    ];
    worksheet['!cols'] = columnWidths;

    // 4. Bikin Workbook (Buku Kerja) & Tempel Worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Harian");

    // 5. Download File
    const fileName = `Rekap_Absensi_${filterDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Rekap Absensi</h1>
          <p className="text-slate-500 dark:text-slate-400">Pantau kedatangan dan kepulangan anak magang.</p>
        </div>
        
        {/* BUTTON EXPORT AKTIF */}
        <Button 
            variant="outline" 
            className="border-slate-200 dark:border-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            onClick={handleExportExcel}
            disabled={filteredLogs.length === 0} // Disable kalo tabel kosong
        >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                {/* Filter Tanggal */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            type="date"
                            className="pl-9 w-[180px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Search & Status */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari nama peserta..."
                            className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                            <Filter className="w-3 h-3 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <SelectItem value="ALL" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800">Semua</SelectItem>
                            <SelectItem value="HADIR" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800">Hadir</SelectItem>
                            <SelectItem value="TELAT" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800">Telat</SelectItem>
                            <SelectItem value="IZIN" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800">Izin/Sakit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px] text-slate-700 dark:text-slate-300 pl-6">No</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Nama Peserta</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Waktu Absen</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status Kehadiran</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 text-right pr-6">Lokasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Loader2 className="animate-spin h-5 w-5" /> Mengambil data absensi...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                        Tidak ada data absen pada tanggal <span className="font-bold text-slate-900 dark:text-slate-200">{format(new Date(filterDate), "dd MMMM yyyy", { locale: id })}</span>
                    </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, index) => (
                  <TableRow key={log.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="text-slate-500 dark:text-slate-400 pl-6">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{log.user.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">{log.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="font-mono font-medium">{log.time} WIB</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        {/* BADGE STATUS CUSTOM */}
                        {log.status === "HADIR" && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                Tepat Waktu
                            </Badge>
                        )}
                        {log.status === "TELAT" && (
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 shadow-none dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                Terlambat
                            </Badge>
                        )}
                        {log.status === "IZIN" && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-none dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                Izin / Sakit
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 text-slate-500 dark:text-slate-400 text-sm">
                            <MapPin className="h-3 w-3" />
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
      <div className="text-xs text-slate-400 dark:text-slate-600 text-center pt-10 border-t border-slate-100 dark:border-slate-800/50 mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}