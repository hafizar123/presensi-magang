"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle2, XCircle, Clock, LogOut } from "lucide-react";
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
  todayLog: any; // Kita terima object log hari ini
}

export default function AttendanceButton({ todayLog }: AttendanceButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"IDLE" | "LOCATING" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  // --- LOGIC TOMBOL PINTER ---
  // 1. Belum absen sama sekali
  const isMasuk = !todayLog; 
  // 2. Udah absen masuk, tapi belum pulang
  const isPulang = todayLog && !todayLog.timeOut; 
  // 3. Udah selesai semua
  const isSelesai = todayLog && todayLog.timeOut;

  // Tentukan Tipe Request
  const requestType = isMasuk ? "IN" : "OUT";

  // Label & Icon
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
  } else if (todayLog && todayLog.status === "IZIN") {
      label = "Izin / Sakit";
      buttonStyle = "bg-blue-50 text-blue-400 border-2 border-blue-100 cursor-not-allowed";
  }

  const handleAttendance = async () => {
    setStep("LOCATING");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setStep("ERROR");
      setErrorMessage("Browser tidak support GPS.");
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
            body: JSON.stringify({ 
                type: requestType, // Kirim tipe IN atau OUT
                latitude, 
                longitude 
            }),
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
        let msg = "Gagal ambil lokasi.";
        if (error.code === 1) msg = "Izin lokasi ditolak. Aktifkan GPS!";
        setErrorMessage(msg);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleCloseSuccess = () => {
    setIsOpen(false);
    router.refresh();
    setTimeout(() => setStep("IDLE"), 300);
  };

  // Jangan render tombol absen kalau lagi Izin/Sakit
  if (todayLog && todayLog.status === "IZIN") {
      return (
        <Button disabled className={`h-14 px-10 rounded-xl text-lg font-bold w-full md:w-auto ${buttonStyle}`}>
            <CheckCircle2 className="mr-2 h-6 w-6" /> Sedang Izin
        </Button>
      );
  }

  return (
    <>
      <Button 
          onClick={() => {
              if (!isSelesai) setIsOpen(true);
          }}
          disabled={isSelesai} 
          className={`h-14 px-10 rounded-xl text-lg font-bold transition-all w-full md:w-auto ${buttonStyle}`}
      >
        <Icon className={`mr-2 h-6 w-6 ${isSelesai ? "" : (isPulang ? "text-orange-600" : "text-[#99775C]")}`} />
        {label}
      </Button>

      {/* DIALOG POPUP */}
      <Dialog open={isOpen} onOpenChange={(val) => {
        if (!val && (step === "LOCATING" || step === "SUBMITTING")) return;
        setIsOpen(val);
        if (!val) setTimeout(() => setStep("IDLE"), 300);
      }}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl gap-0">
          
          <div className={`h-32 w-full flex items-center justify-center ${
            step === "SUCCESS" ? "bg-green-100" : 
            step === "ERROR" ? "bg-red-100" : 
            isPulang ? "bg-orange-100" : "bg-[#EAE7DD]"
          }`}>
             {step === "IDLE" && (
                isPulang ? <LogOut className="h-16 w-16 text-orange-500 animate-pulse" /> : <MapPin className="h-16 w-16 text-[#99775C] animate-bounce" />
             )}
             
             {(step === "LOCATING" || step === "SUBMITTING") && (
                <div className="relative flex items-center justify-center">
                    <span className={`absolute inline-flex h-20 w-20 animate-ping rounded-full opacity-20 ${isPulang ? "bg-orange-500" : "bg-[#99775C]"}`}></span>
                    <Loader2 className={`h-10 w-10 animate-spin ${isPulang ? "text-orange-500" : "text-[#99775C]"}`} />
                </div>
             )}

             {step === "SUCCESS" && <CheckCircle2 className="h-20 w-20 text-green-600 animate-in zoom-in duration-300" />}
             {step === "ERROR" && <XCircle className="h-20 w-20 text-red-600 animate-in shake duration-300" />}
          </div>

          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-center text-xl font-bold text-slate-800">
                {step === "IDLE" && (isPulang ? "Konfirmasi Pulang?" : "Konfirmasi Masuk?")}
                {(step === "LOCATING" || step === "SUBMITTING") && "Memproses..."}
                {step === "SUCCESS" && "Berhasil!"}
                {step === "ERROR" && "Gagal"}
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500">
                {step === "IDLE" && (isPulang 
                    ? "Pastikan pekerjaan hari ini sudah selesai." 
                    : "Pastikan kamu sudah berada di area kantor.")}
                {step === "ERROR" && errorMessage}
                {step === "SUCCESS" && (isPulang ? "Sampai jumpa besok!" : "Selamat bekerja!")}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-center w-full">
               {step === "IDLE" && (
                 <div className="grid grid-cols-2 gap-3 w-full">
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="h-11 rounded-xl">Batal</Button>
                    <Button onClick={handleAttendance} className={`h-11 rounded-xl text-white ${isPulang ? "bg-orange-500 hover:bg-orange-600" : "bg-[#99775C] hover:bg-[#7a5e48]"}`}>
                        Ya, {isPulang ? "Pulang" : "Masuk"}
                    </Button>
                 </div>
               )}
               {step === "SUCCESS" && (
                 <Button onClick={handleCloseSuccess} className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white">Tutup</Button>
               )}
               {step === "ERROR" && (
                 <Button variant="outline" onClick={() => setStep("IDLE")} className="w-full h-11 rounded-xl border-red-200 text-red-600 hover:bg-red-50">Coba Lagi</Button>
               )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}