"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Tipe data user biar ga error
interface UserProps {
  user: {
    id: string;
    internProfile?: {
      startDate: string | Date;
      endDate: string | Date;
      startHour: string;
      endHour: string;
    } | null;
  };
}

export default function ScheduleDialog({ user }: UserProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil data lama kalo ada (biar form keisi)
  const [formData, setFormData] = useState({
    startDate: user.internProfile?.startDate ? new Date(user.internProfile.startDate).toISOString().split('T')[0] : "",
    endDate: user.internProfile?.endDate ? new Date(user.internProfile.endDate).toISOString().split('T')[0] : "",
    startHour: user.internProfile?.startHour || "08:00",
    endHour: user.internProfile?.endHour || "16:00",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

      if (res.ok) {
        alert("Jadwal Berhasil Disimpan!");
        setOpen(false);
        router.refresh(); 
      } else {
        alert("Gagal simpan jadwal");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* BUTTON YANG TADI KEDAP KEDIP KITA UPDATE DISINI */}
        <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-300"
        >
          <Settings2 className="mr-2 h-3 w-3" />
          Atur Jadwal
        </Button>
      </DialogTrigger>
      
      {/* KONTEN POPUP (MODAL) BIAR DARK MODE */}
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">Atur Jadwal Magang</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Tentukan tanggal mulai/selesai dan jam kerja harian.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Mulai Magang</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        type="date" 
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Selesai Magang</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        type="date" 
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                </div>
            </div>
          </div>

          {/* Jam Kerja */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Jam Masuk</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        type="time" 
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        value={formData.startHour}
                        onChange={(e) => setFormData({...formData, startHour: e.target.value})}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Jam Pulang</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        type="time" 
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        value={formData.endHour}
                        onChange={(e) => setFormData({...formData, endHour: e.target.value})}
                    />
                </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}