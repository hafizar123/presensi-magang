"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Settings2, 
  CheckCircle2, 
  Briefcase,
  CalendarX,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

interface UserProps {
  user: {
    id: string;
    internProfile?: {
      startDate: string | Date;
      endDate: string | Date;
    } | null;
  };
}

export default function ScheduleDialog({ user }: UserProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  // Ambil tanggal hari ini (YYYY-MM-DD) buat validasi MIN
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    startDate: user.internProfile?.startDate 
      ? new Date(user.internProfile.startDate).toISOString().split('T')[0] 
      : "",
    endDate: user.internProfile?.endDate 
      ? new Date(user.internProfile.endDate).toISOString().split('T')[0] 
      : "",
  });

  const handleSave = async () => {
    // 1. Cek Kelengkapan
    if (!formData.startDate || !formData.endDate) {
        toast.warning("Data Belum Lengkap", { description: "Mohon isi kedua tanggal." });
        return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const todayDate = new Date(today); // Reset jam ke 00:00:00 via string split logic di atas

    // 2. Cek Tanggal Masa Lalu (Hanya validasi kalo data baru/diubah)
    // Logikanya: Kalo user set tanggal < hari ini, tolak.
    if (start < todayDate) {
        toast.error("Tanggal Tidak Valid", {
            description: "Tidak bisa set tanggal mulai di masa lalu (kemarin/bulan lalu).",
            icon: <CalendarX className="text-red-500 h-5 w-5" />
        });
        return;
    }

    // 3. Cek Logika Durasi
    if (start > end) {
        toast.error("Durasi Error", {
            description: "Tanggal selesai harus SETELAH tanggal mulai.",
            icon: <AlertTriangle className="text-orange-500 h-5 w-5" />
        });
        return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          startDate: formData.startDate,
          endDate: formData.endDate
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        router.refresh(); 
        toast.success("Berhasil", { description: "Periode magang disimpan." });
      } else {
        toast.error("Gagal", { description: data.message || "Gagal menyimpan data." });
      }
    } catch (error) {
      toast.error("Error", { description: "Gagal terhubung ke server." });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setIsSuccess(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524] text-slate-700 dark:text-[#EAE7DD] transition-all duration-300 font-medium"
        >
          <Settings2 className="mr-2 h-3.5 w-3.5 text-[#99775C]" />
          Atur Periode
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`${isSuccess ? "sm:max-w-[400px]" : "sm:max-w-[500px]"} bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl`}>
        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Tersimpan!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm">Periode magang peserta berhasil diatur.</p>
                <Button onClick={handleClose} className="mt-6 bg-[#99775C] hover:bg-[#86664d] text-white w-full rounded-xl">Tutup</Button>
            </div>
        ) : (
            <>
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#292524] bg-slate-50/50 dark:bg-[#292524]/30">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-[#99775C]" /> Konfigurasi Periode
                        </DialogTitle>
                        <DialogDescription>Tentukan masa aktif magang peserta.</DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Mulai Magang</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#99775C]" />
                                <Input 
                                    type="date" 
                                    // VALIDASI FRONTEND: Gak bisa pilih tanggal < hari ini
                                    min={today}
                                    className="pl-10 h-11 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none focus-visible:ring-[#99775C]"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Selesai Magang</Label>
                            <div className="relative">
                                <CalendarX className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                                <Input 
                                    type="date" 
                                    // VALIDASI FRONTEND: Minimal sama kayak start date
                                    min={formData.startDate || today}
                                    className="pl-10 h-11 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none focus-visible:ring-[#99775C]"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30 flex gap-3 items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500">Perhatian</p>
                            <p className="text-[11px] text-yellow-600 dark:text-yellow-400/80 leading-tight">
                                Peserta hanya bisa melakukan presensi dalam rentang tanggal yang Anda atur di atas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md">
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}