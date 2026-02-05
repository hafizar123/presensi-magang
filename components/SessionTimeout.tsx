"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SessionTimeout() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // SETTING WAKTU: 30 Menit (dalam milidetik)
  // 30 * 60 * 1000 = 1800000
  const TIMEOUT_MS = 30 * 60 * 1000; 
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Kalau gak login, gak usah jalanin timer
    if (!session) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        // Aksi pas waktu habis
        toast.warning("Sesi Berakhir", { 
            description: "Anda otomatis keluar karena tidak ada aktivitas." 
        });
        
        signOut({ callbackUrl: "/login" }); // Redirect ke login
      }, TIMEOUT_MS);
    };

    // Event Listener buat deteksi aktivitas
    const events = ["click", "scroll", "keydown", "mousemove"];
    
    // Pasang listener
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Jalanin timer pertama kali
    resetTimer();

    // Bersihin listener pas component di-unmount (pindah halaman/tutup tab)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [session, router]);

  return null; // Komponen ini gak nampilin apa-apa di layar (Invisible)
}