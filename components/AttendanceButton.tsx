"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AttendanceButtonProps {
  type: "IN" | "OUT";
  disabled?: boolean;
}

export default function AttendanceButton({ type, disabled }: AttendanceButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"IDLE" | "LOCATING" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");

  const isMasuk = type === "IN";
  const label = isMasuk ? "Absen Masuk" : "Absen Pulang";
  
  // UPDATE WARNA: Kuning Emas (Yellow-400) dengan Teks Hijau Gelap
  const buttonStyle = isMasuk 
    ? "bg-yellow-400 hover:bg-yellow-500 text-[#1a4d2e] shadow-lg shadow-yellow-400/20 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1" 
    : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50";

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
            body: JSON.stringify({ type, latitude, longitude }),
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.message || "Gagal absen.");

          setStep("SUCCESS");
          
        } catch (error: any) {
            setStep("ERROR");
            setErrorMessage(error.message);
        }
      },
      (error) => {
        setStep("ERROR");
        let msg = "Gagal ambil lokasi.";
        if (error.code === 1) msg = "Izin lokasi ditolak. Aktifkan GPS!";
        else if (error.code === 2) msg = "Sinyal GPS lemah/hilang.";
        else if (error.code === 3) msg = "Waktu habis (Timeout).";
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

  return (
    <>
      <Button 
          onClick={() => setIsOpen(true)}
          disabled={disabled} 
          className={`h-14 px-10 rounded-xl text-lg font-bold transition-all ${buttonStyle}`}
      >
        {isMasuk ? <Clock className="mr-2 h-6 w-6" /> : <MapPin className="mr-2 h-6 w-6" />}
        {label}
      </Button>

      {/* --- POP UP CARD TETEP SAMA --- */}
      <Dialog open={isOpen} onOpenChange={(val) => {
        if (!val && (step === "LOCATING" || step === "SUBMITTING")) return;
        setIsOpen(val);
        if (!val) setTimeout(() => setStep("IDLE"), 300);
      }}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl gap-0">
          <div className={`h-32 w-full flex items-center justify-center ${
            step === "SUCCESS" ? "bg-green-100" : 
            step === "ERROR" ? "bg-red-100" : "bg-slate-50"
          }`}>
             {step === "IDLE" && <MapPin className="h-16 w-16 text-yellow-500 animate-bounce" />}
             
             {(step === "LOCATING" || step === "SUBMITTING") && (
                <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-yellow-400 opacity-20"></span>
                    <div className="relative bg-white p-4 rounded-full shadow-sm">
                        <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
                    </div>
                </div>
             )}

             {step === "SUCCESS" && <CheckCircle2 className="h-20 w-20 text-green-600 animate-in zoom-in duration-300" />}
             {step === "ERROR" && <XCircle className="h-20 w-20 text-red-600 animate-in shake duration-300" />}
          </div>

          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-center text-xl font-bold text-slate-800">
                {step === "IDLE" && "Konfirmasi Lokasi"}
                {(step === "LOCATING" || step === "SUBMITTING") && "Memproses..."}
                {step === "SUCCESS" && "Presensi Berhasil!"}
                {step === "ERROR" && "Gagal Absen"}
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500">
                {step === "IDLE" && "Pastikan kamu sudah berada di area kantor sebelum melanjutkan."}
                {step === "LOCATING" && "Sedang mencari titik koordinat GPS..."}
                {step === "SUBMITTING" && "Mengirim data ke server..."}
                {step === "SUCCESS" && `Data ${label.toLowerCase()} kamu telah tersimpan.`}
                {step === "ERROR" && errorMessage}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-center w-full">
               {step === "IDLE" && (
                 <div className="grid grid-cols-2 gap-3 w-full">
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="h-11 rounded-xl">
                        Batal
                    </Button>
                    <Button onClick={handleAttendance} className="h-11 rounded-xl bg-[#1a4d2e] hover:bg-[#143d24] text-white">
                        Ya, Absen
                    </Button>
                 </div>
               )}

               {step === "SUCCESS" && (
                 <Button onClick={handleCloseSuccess} className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white">
                    Tutup & Refresh
                 </Button>
               )}

               {step === "ERROR" && (
                 <Button variant="outline" onClick={() => setStep("IDLE")} className="w-full h-11 rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                    Coba Lagi
                 </Button>
               )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}