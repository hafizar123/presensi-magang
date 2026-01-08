"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Save, Loader2, Settings } from "lucide-react";
import { format } from "date-fns"; // Opsional buat formatting kalo butuh

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

// Tipe data props (data yang dikirim dari tabel admin)
interface ScheduleDialogProps {
  user: {
    id: string;
    name: string;
    internProfile?: {
      startDate: Date;
      endDate: Date;
      startHour: string;
      endHour: string;
    } | null;
  };
}

export default function ScheduleDialog({ user }: ScheduleDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Form (Default value diambil dari data yg udah ada kalo ada)
  const [formData, setFormData] = useState({
    startDate: user.internProfile?.startDate 
      ? new Date(user.internProfile.startDate).toISOString().split('T')[0] 
      : "",
    endDate: user.internProfile?.endDate 
      ? new Date(user.internProfile.endDate).toISOString().split('T')[0] 
      : "",
    startHour: user.internProfile?.startHour || "07:00",
    endHour: user.internProfile?.endHour || "08:00",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
        }),
      });

      if (res.ok) {
        alert("Mantap! Jadwal berhasil diatur.");
        setOpen(false); // Tutup popup
        router.refresh(); // Refresh halaman admin biar statusnya berubah ijo
      } else {
        alert("Gagal nyimpen data bro.");
      }
    } catch (error) {
      alert("Error server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 shadow-sm border-slate-300">
          <Settings className="h-4 w-4" />
          {user.internProfile ? "Edit Jadwal" : "Atur Jadwal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atur Jadwal Magang</DialogTitle>
          <DialogDescription>
            Setting jam kerja dan tanggal magang untuk <b>{user.name}</b>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          
          {/* Tanggal Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Mulai Tanggal
              </Label>
              <Input 
                type="date" 
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Sampai Tanggal
              </Label>
              <Input 
                type="date" 
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 my-1"></div>

          {/* Jam Masuk & Pulang (Batas Absen) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Buka Absen
              </Label>
              <Input 
                type="time" 
                value={formData.startHour}
                onChange={(e) => setFormData({...formData, startHour: e.target.value})}
              />
              <p className="text-[10px] text-slate-500">Awal bisa absen</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Tutup Absen
              </Label>
              <Input 
                type="time" 
                value={formData.endHour}
                onChange={(e) => setFormData({...formData, endHour: e.target.value})}
              />
              <p className="text-[10px] text-slate-500">Lewat ini dihitung telat</p>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}