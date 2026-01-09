"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Fingerprint, MapPinOff } from "lucide-react";

interface AttendanceButtonProps {
  disabled: boolean;
  label: string;
}

export default function AttendanceButton({ disabled, label }: AttendanceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- 📍 KONFIGURASI LOKASI KANTOR (DISDIKPORA DIY) ---
  // Ganti ini pake koordinat asli dari Google Maps!
  // Cara cek: Buka Maps, klik kanan di gedung kantor, copy angkanya.
  const OFFICE_LAT = -7.7993239; 
  const OFFICE_LNG = 110.3843580;
  const MAX_RADIUS_METERS = 100; // Radius toleransi (meter)

  // Rumus Haversine (Matematika buat ngitung jarak di bumi)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Jari-jari bumi dalam meter
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Hasil dalam meter
  };

  const handleAbsen = async () => {
    setLoading(true);

    // 1. Cek Support Browser
    if (!navigator.geolocation) {
      alert("Browser lu ga support GPS bro, ganti HP gih.");
      setLoading(false);
      return;
    }

    // 2. Ambil Lokasi
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // 3. Hitung Jarak
        const distance = calculateDistance(userLat, userLng, OFFICE_LAT, OFFICE_LNG);
        console.log(`Jarak User: ${distance.toFixed(2)} meter`); // Buat debugging di console

        // 4. Validasi Radius
        if (distance > MAX_RADIUS_METERS) {
          alert(`Waduh! Kejauhan bro. Lu berjarak ${distance.toFixed(0)} meter dari kantor. (Max: ${MAX_RADIUS_METERS}m)`);
          setLoading(false);
          return;
        }

        // 5. Kalo Lolos, Lanjut Tembak API
        if (!confirm("Lokasi valid! Yakin mau absen sekarang?")) {
            setLoading(false);
            return;
        }

        try {
          const res = await fetch("/api/attendance", { method: "POST" });
          const data = await res.json();

          if (res.ok) {
            alert(`MANTAP! Absen berhasil. Status: ${data.status}`);
            router.refresh();
          } else {
            alert(data.message);
          }
        } catch (error) {
          alert("Gagal konek server");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        // Handle Error GPS (Misal user nolak akses lokasi)
        console.error(error);
        alert("Gagal ambil lokasi. Pastiin GPS nyala dan izinkan akses lokasi di browser!");
        setLoading(false);
      },
      { enableHighAccuracy: true } // Biar akurat banget
    );
  };

  return (
    <div className="w-full max-w-xs">
      <Button
        size="lg"
        onClick={handleAbsen}
        disabled={disabled || loading}
        className={`w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 ${
          disabled
            ? "bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed shadow-none"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Cek Lokasi...
          </>
        ) : (
          <>
            {!disabled && <Fingerprint className="h-6 w-6" />}
            {label}
          </>
        )}
      </Button>
    </div>
  );
}