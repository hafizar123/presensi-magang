"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AttendanceButtonProps {
  todayLog: any; 
}

export default function AttendanceButton({ todayLog }: AttendanceButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"IDLE" | "LOCATING" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  const isMasuk = !todayLog; 
  const isPulang = todayLog && !todayLog.timeOut; 
  const isSelesai = todayLog && todayLog.timeOut;
  const requestType = isMasuk ? "IN" : "OUT";

  let label = "Absen Masuk";
  let Icon = MapPin;
  let buttonStyle = "bg-[#EAE7DD] hover:bg-white text-[#5c4a3d] border-b-4 border-[#99775C] active:border-b-0 active:translate-y-1 shadow-lg";

  if (isPulang) {
      label = "Absen Pulang";
      Icon = LogOut;
      buttonStyle = "bg-orange-100 hover:bg-orange-50 text-orange-700 border-b-4 border-orange-500 active:border-b-0 active:translate-y-1 shadow-lg";
  } else if (isSelesai) {
      label = "Selesai";
      Icon = CheckCircle2;
      buttonStyle = "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed opacity-80";
  }

  const handleAttendance = async () => {
    setStep("LOCATING");
    setErrorMessage("");
    if (!navigator.geolocation) {
      setStep("ERROR");
      setErrorMessage("Perangkat tidak mendukung GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setStep("SUBMITTING");
          const { latitude, longitude } = position.coords;
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: requestType, latitude, longitude }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Gagal absen.");
          setStep("SUCCESS");
          toast.success(data.message);
        } catch (error: any) {
            setStep("ERROR");
            setErrorMessage(error.message);
        }
      },
      (error) => {
        setStep("ERROR");
        setErrorMessage(error.code === 1 ? "Izin lokasi ditolak!" : "Gagal ambil lokasi.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleCloseSuccess = () => {
    setIsOpen(false);
    router.refresh();
    setTimeout(() => setStep("IDLE"), 300);
  };

  return (
    <>
      <Button 
          onClick={() => { if (!isSelesai) setIsOpen(true); }}
          disabled={isSelesai} 
          className={`h-14 px-10 rounded-xl text-lg font-bold transition-all w-full md:w-auto ${buttonStyle}`}
      >
        <Icon className={`mr-2 h-6 w-6 ${isSelesai ? "" : (isPulang ? "text-orange-600" : "text-[#99775C]")}`} />
        {label}
      </Button>

      <Dialog open={isOpen} onOpenChange={(val) => {
        if (!val && (step === "LOCATING" || step === "SUBMITTING")) return;
        setIsOpen(val);
        if (!val) setTimeout(() => setStep("IDLE"), 300);
      }}>
        {/* Adaptive Size: Ramping di HP (78vw), Elegan di Laptop (440px) */}
        <DialogContent className="!w-[78vw] sm:!w-full sm:!max-w-[440px] p-0 border-none bg-transparent shadow-none outline-none overflow-hidden">
          <div className="bg-white/95 dark:bg-[#0c0a09]/95 border border-white/20 dark:border-[#292524] rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className={`h-28 sm:h-36 w-full flex items-center justify-center ${
              step === "SUCCESS" ? "bg-green-100/60 dark:bg-green-950/20 text-green-600" : 
              step === "ERROR" ? "bg-red-100/60 dark:bg-red-950/20 text-red-600" : 
              isPulang ? "bg-orange-100/60 dark:bg-orange-950/20 text-orange-600" : "bg-[#EAE7DD]/60 dark:bg-[#99775C]/10 text-[#99775C]"
            }`}>
               {step === "IDLE" && (isPulang ? <LogOut className="h-12 w-12 sm:h-16 sm:w-16" /> : <MapPin className="h-12 w-12 sm:h-16 sm:w-16" />)}
               {(step === "LOCATING" || step === "SUBMITTING") && <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin" />}
               {step === "SUCCESS" && <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16" />}
               {step === "ERROR" && <XCircle className="h-12 w-12 sm:h-16 sm:w-16" />}
            </div>
            <div className="p-6 sm:p-10 flex flex-col items-center">
              <DialogHeader className="mb-6 flex flex-col items-center justify-center w-full">
                <DialogTitle className="text-center text-lg sm:text-2xl font-bold w-full">
                  {step === "IDLE" && (isPulang ? "Presensi Pulang" : "Presensi Masuk")}
                  {step === "SUCCESS" && "Berhasil"}
                  {step === "ERROR" && "Gagal"}
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500 dark:text-gray-400 text-[10px] sm:text-sm leading-relaxed px-2 w-full">
                  {step === "IDLE" && (isPulang ? "Pastikan seluruh tugas Anda telah terselesaikan." : "Pastikan Anda berada di area kantor yang ditentukan.")}
                  {step === "ERROR" && errorMessage}
                  {step === "SUCCESS" && "Data kehadiran Anda telah tercatat secara resmi."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col gap-2 w-full items-center">
                 {step === "IDLE" && (
                   <div className="grid grid-cols-2 gap-3 w-full">
                      <Button variant="outline" onClick={() => setIsOpen(false)} className="h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-semibold">Batal</Button>
                      <Button onClick={handleAttendance} className={`h-10 sm:h-12 rounded-xl text-white text-xs sm:text-sm font-bold ${isPulang ? "bg-orange-500" : "bg-[#99775C]"}`}>Konfirmasi</Button>
                   </div>
                 )}
                 {step === "SUCCESS" && <Button onClick={handleCloseSuccess} className="w-full h-10 sm:h-12 rounded-xl bg-green-600 text-white text-xs sm:text-sm font-bold">Tutup</Button>}
                 {step === "ERROR" && <Button variant="outline" onClick={() => setStep("IDLE")} className="w-full h-10 sm:h-12 rounded-xl border-red-200 text-red-600 text-xs sm:text-sm font-bold">Coba Lagi</Button>}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}