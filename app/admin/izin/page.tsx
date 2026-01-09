"use client";

import { useEffect, useState, Fragment } from "react";
import { 
  Check, X, FileText, Calendar, Loader2, ChevronDown, ChevronUp, Clock, Search, Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type LeaveRequest = {
  id: string;
  user: { name: string; email: string };
  date: string;
  reason: string;
  proofFile: string | null;
  status: string;
  createdAt: string;
};

export default function AdminIzinPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // --- FILTER STATE ---
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING"); // Default liat yang Pending dulu

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/izin");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --- LOGIC FILTERING ---
  const filteredRequests = requests.filter((req) => {
    // 1. Filter Nama
    const matchName = req.user.name.toLowerCase().includes(searchName.toLowerCase());
    
    // 2. Filter Status (Kalo ALL tampil semua)
    const matchStatus = filterStatus === "ALL" ? true : req.status === filterStatus;
    
    // 3. Filter Tanggal (Kalo kosong tampil semua)
    // Kita ambil bagian tanggalnya aja "YYYY-MM-DD" dari string ISO
    const reqDate = new Date(req.date).toISOString().split('T')[0];
    const matchDate = filterDate ? reqDate === filterDate : true;

    return matchName && matchStatus && matchDate;
  });

  const toggleRow = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  const handleDecision = async (id: string, decision: "APPROVED" | "REJECTED") => {
    if (!confirm(`Yakin mau ${decision === "APPROVED" ? "TERIMA" : "TOLAK"} izin ini?`)) return;

    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/izin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: decision }),
      });

      if (res.ok) {
        alert(`Berhasil ${decision}!`);
        fetchRequests(); 
        setExpandedRowId(null);
      } else {
        alert("Gagal update status");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Approval Izin</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola pengajuan izin & sakit magang.</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        {/* HEADER: TEMPAT FILTER */}
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
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
                            placeholder="Cari nama..."
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
                            <SelectItem value="PENDING" className="text-yellow-600 dark:text-yellow-400 focus:bg-slate-100 dark:focus:bg-slate-800">Pending</SelectItem>
                            <SelectItem value="APPROVED" className="text-green-600 dark:text-green-400 focus:bg-slate-100 dark:focus:bg-slate-800">Disetujui</SelectItem>
                            <SelectItem value="REJECTED" className="text-red-600 dark:text-red-400 focus:bg-slate-100 dark:focus:bg-slate-800">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Nama Pemohon</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Tanggal Izin</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300">Diajukan Pada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Loader2 className="animate-spin h-4 w-4" /> Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada data yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => {
                  const isExpanded = expandedRowId === req.id;
                  
                  return (
                    <Fragment key={req.id}>
                      {/* BARIS UTAMA */}
                      <TableRow 
                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 ${isExpanded ? "bg-slate-50 dark:bg-slate-800/30 border-b-0" : ""}`}
                        onClick={() => toggleRow(req.id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-200">{req.user.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-500">{req.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">
                                {new Date(req.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell>
                          {req.status === "PENDING" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 font-normal">
                                Menunggu
                            </Badge>
                          )}
                          {req.status === "APPROVED" && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                Disetujui
                            </Badge>
                          )}
                          {req.status === "REJECTED" && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                Ditolak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-slate-400 text-xs">
                           <div className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(req.createdAt).toLocaleDateString("id-ID")}
                           </div>
                        </TableCell>
                      </TableRow>

                      {/* BARIS DETAIL (EXPANDED) */}
                      {isExpanded && (
                        <TableRow className="bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 border-t-0 shadow-inner">
                          <TableCell colSpan={5} className="p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start ml-8 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                                
                                {/* Kiri: Detail */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alasan Izin</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                                            "{req.reason}"
                                        </p>
                                    </div>
                                    
                                    {req.proofFile ? (
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bukti Lampiran</p>
                                            <a 
                                                href={`/uploads/${req.proofFile}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/50 transition-colors"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Lihat Dokumen Pendukung
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic flex items-center gap-1">
                                            <X className="h-3 w-3" /> Tidak ada lampiran file.
                                        </p>
                                    )}
                                </div>

                                {/* Kanan: Action (HANYA MUNCUL KALO STATUS PENDING) */}
                                {req.status === "PENDING" ? (
                                    <div className="flex flex-col gap-3 justify-end h-full">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tindakan</p>
                                        <div className="flex gap-3">
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 h-10"
                                                onClick={() => handleDecision(req.id, "REJECTED")}
                                                disabled={!!processingId}
                                            >
                                                <X className="mr-2 h-4 w-4" /> Tolak
                                            </Button>
                                            <Button 
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 h-10"
                                                onClick={() => handleDecision(req.id, "APPROVED")}
                                                disabled={!!processingId}
                                            >
                                                {processingId === req.id ? (
                                                    <Loader2 className="animate-spin h-4 w-4" />
                                                ) : (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" /> Setujui
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 text-center mt-2">
                                            *Setujui = Masuk Rekap Absensi.
                                        </p>
                                    </div>
                                ) : (
                                    // Kalo udah Approved/Rejected, tampilin Info doang (Gak ada tombol)
                                    <div className="flex flex-col gap-3 justify-end h-full">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keputusan Admin</p>
                                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                Permohonan ini sudah <span className={req.status === "APPROVED" ? "text-green-600 dark:text-green-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                                                    {req.status === "APPROVED" ? "DISETUJUI" : "DITOLAK"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
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