"use client";

import { useEffect, useState } from "react";
import { 
  Check, X, FileText, Calendar, User, 
  CheckCircle2, Loader2, Filter, Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LeaveRequest = {
  id: string;
  user: { name: string; email: string };
  date: string;
  reason: string;
  proofFile: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function IzinPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PENDING");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/izin");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Gagal ambil data izin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openConfirm = (id: string, type: "APPROVED" | "REJECTED") => {
    setSelectedId(id);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedId || !actionType) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/izin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, status: actionType }),
      });

      if (res.ok) {
        setIsConfirmOpen(false);
        setSuccessMessage(
            actionType === "APPROVED" 
            ? "Izin berhasil disetujui!" 
            : "Izin berhasil ditolak."
        );
        setIsSuccessOpen(true);
        fetchRequests();
      } else {
        alert("Gagal memproses data");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    filterStatus === "ALL" ? true : req.status === filterStatus
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* POP-UP KONFIRMASI */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-xl">
            <AlertDialogHeader>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${actionType === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-[#99775C]/20 text-[#99775C]'}`}>
                        {actionType === 'REJECTED' ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                    </div>
                    <AlertDialogTitle className="text-slate-900 dark:text-[#EAE7DD]">
                        {actionType === 'REJECTED' ? "Tolak Pengajuan?" : "Setujui Pengajuan?"}
                    </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="pl-[3.25rem] text-slate-500 dark:text-gray-400">
                    {actionType === 'REJECTED' 
                        ? "Status akan berubah DITOLAK. User harus mengajukan ulang jika ingin merevisi." 
                        : "Status akan DISETUJUI. Sistem akan mencatat user sebagai 'IZIN' pada tanggal tersebut."
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
                <AlertDialogCancel className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] rounded-lg text-slate-900 dark:text-[#EAE7DD] hover:bg-slate-100 dark:hover:bg-[#3f2e26]/80">
                    Batal
                </AlertDialogCancel>
                <AlertDialogAction 
                    onClick={(e) => { e.preventDefault(); handleProcess(); }}
                    disabled={isProcessing}
                    className={`text-white rounded-lg ${actionType === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : (actionType === 'REJECTED' ? "Ya, Tolak" : "Ya, Setujui")}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* POP-UP SUKSES */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Berhasil Diproses!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                    {successMessage}
                </p>
                <Button 
                    onClick={() => setIsSuccessOpen(false)}
                    className="mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full rounded-xl"
                >
                    Tutup
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Approval Izin</h1>
          <p className="text-slate-500 dark:text-gray-400">Validasi pengajuan izin sakit atau cuti magang.</p>
        </div>
        
        {/* === FILTER FIX: COPY-PASTE DR INTERNS TABLE === */}
        <div className="w-full sm:w-[160px] shrink-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-10 w-full bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] rounded-xl text-sm font-medium focus:ring-[#99775C]">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                        <Filter className="h-3.5 w-3.5 shrink-0" />
                        <SelectValue placeholder="Status" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] dark:text-[#EAE7DD]">
                    <SelectItem value="PENDING">Menunggu</SelectItem>
                    <SelectItem value="APPROVED">Disetujui</SelectItem>
                    <SelectItem value="REJECTED">Ditolak</SelectItem>
                    <SelectItem value="ALL">Semua</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* List Card Izin */}
      <div className="grid gap-4">
        {loading ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#99775C]" />
                <span>Memuat data izin...</span>
            </div>
        ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-[#292524] rounded-xl">
                <p className="text-slate-400">Tidak ada pengajuan izin dengan status ini.</p>
            </div>
        ) : (
            filteredRequests.map((req) => (
                <Card key={req.id} className="border-none shadow-sm bg-white dark:bg-[#1c1917] hover:shadow-md transition-all overflow-hidden rounded-2xl">
                    <CardHeader className="pb-3 border-b border-slate-50 dark:border-[#292524]">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-[#99775C]/10 text-[#99775C] rounded-xl mt-1">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                                        Pengajuan Izin
                                        {req.status === "PENDING" && <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-[10px]">Menunggu</Badge>}
                                        {req.status === "APPROVED" && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 text-[10px]">Disetujui</Badge>}
                                        {req.status === "REJECTED" && <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 text-[10px]">Ditolak</Badge>}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 flex items-center gap-1 dark:text-gray-500">
                                        <User className="h-3 w-3" /> {req.user.name} 
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="text-right text-xs text-slate-400 dark:text-gray-600">
                                {new Date(req.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                        {/* Box Dalam Card: Konsisten pake style input (dark:bg-[#292524]) */}
                        <div className="bg-slate-50 dark:bg-[#292524] p-4 rounded-xl border border-slate-200 dark:border-[#3f2e26] space-y-3">
                            {/* ALASAN */}
                            <div className="flex items-start gap-3">
                                <span className="text-slate-400 text-xs w-20 flex-shrink-0 font-medium dark:text-gray-500">Keterangan</span>
                                <p className="text-sm text-slate-700 dark:text-gray-300 font-medium leading-relaxed italic">
                                    "{req.reason}"
                                </p>
                            </div>
                            
                            {/* TANGGAL */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 text-xs w-20 flex-shrink-0 font-medium dark:text-gray-500">Tanggal Izin</span>
                                <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-[#EAE7DD] font-bold bg-white dark:bg-[#1c1917] px-2 py-1 rounded border border-slate-200 dark:border-[#3f2e26]">
                                    <Calendar className="h-3.5 w-3.5 text-[#99775C]" />
                                    {new Date(req.date).toLocaleDateString("id-ID", { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </div>
                            </div>

                            {/* FILE BUKTI */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 text-xs w-20 flex-shrink-0 font-medium dark:text-gray-500">Lampiran</span>
                                {req.proofFile ? (
                                    <a 
                                        href={`/uploads/${req.proofFile}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        <Button variant="outline" size="sm" className="h-8 text-xs border-[#99775C]/30 bg-[#99775C]/10 text-[#99775C] hover:bg-[#99775C]/20 dark:border-[#3f2e26] dark:text-[#EAE7DD] rounded-lg">
                                            <Eye className="h-3 w-3 mr-2" />
                                            Lihat Surat
                                        </Button>
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 italic dark:text-gray-600">Tidak ada lampiran file.</span>
                                )}
                            </div>
                        </div>

                        {/* TOMBOL AKSI */}
                        {req.status === "PENDING" && (
                            <div className="flex gap-3 mt-4 justify-end">
                                <Button 
                                    variant="outline" 
                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:bg-[#292524] dark:border-[#3f2e26] dark:hover:bg-red-900/20 hover:text-red-700 h-9 rounded-xl"
                                    onClick={() => openConfirm(req.id, "REJECTED")}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Tolak
                                </Button>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-9 border-none rounded-xl"
                                    onClick={() => openConfirm(req.id, "APPROVED")}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Setujui
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}