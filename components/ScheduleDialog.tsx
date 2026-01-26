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
  Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";

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

  const [formData, setFormData] = useState({
    startDate: user.internProfile?.startDate ? new Date(user.internProfile.startDate).toISOString().split('T')[0] : "",
    endDate: user.internProfile?.endDate ? new Date(user.internProfile.endDate).toISOString().split('T')[0] : "",
  });

  const handleSave = async () => {
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

      if (res.ok) {
        setIsSuccess(true);
        router.refresh(); 
      } else {
        alert("Gagal simpan periode magang");
      }
    } catch (error) {
      alert("Error server");
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
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-300"
        >
          <Settings2 className="mr-2 h-3 w-3" />
          Atur Periode
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`${isSuccess ? "sm:max-w-[400px]" : "sm:max-w-[600px]"} bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-all duration-300 p-0 overflow-hidden rounded-2xl`}>
        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Periode Disimpan!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-[250px]">
                    Durasi waktu magang user ini berhasil diperbarui.
                </p>
                <Button 
                    onClick={handleClose} 
                    className="mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full rounded-xl font-medium"
                >
                    Tutup
                </Button>
            </div>
        ) : (
            <>
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">Konfigurasi Periode</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                            Atur durasi magang (Jam kerja mengikuti pengaturan global).
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" /> Masa Aktif Magang
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Mulai</Label>
                                <Input 
                                    type="date" 
                                    className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Selesai</Label>
                                <Input 
                                    type="date" 
                                    className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => setOpen(false)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6"
                    >
                        {loading ? "Menyimpan..." : "Simpan Periode"}
                    </Button>
                </div>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}