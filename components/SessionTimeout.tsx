"use client";

import { useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function SessionTimeout() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // 7 Menit (dalam milidetik)
  const TIMEOUT_MS = 10 * 1000; 
  const STORAGE_KEY = "lastTimeStamp";

  const handleLogout = useCallback(() => {
    // Hapus timestamp biar bersih
    localStorage.removeItem(STORAGE_KEY);
    
    // Simpan URL sekarang buat redirect balik nanti
    const callbackUrl = encodeURIComponent(pathname);
    
    // Logout tanpa redirect default, kita handle manual
    signOut({ redirect: false }).then(() => {
      // Lempar ke login dengan parameter timeout=true
      router.push(`/login?callbackUrl=${callbackUrl}&timeout=true`);
    });
  }, [pathname, router]);

  // Fungsi update waktu aktif
  const updateActivity = useCallback(() => {
    if (status === "authenticated") {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }, [status]);

  // Checker utama (jalan tiap detik biar responsif)
  useEffect(() => {
    if (status !== "authenticated") return;

    // Set waktu awal kalo belum ada
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    const interval = setInterval(() => {
      const lastStamp = localStorage.getItem(STORAGE_KEY);
      if (lastStamp) {
        const now = Date.now();
        const timePassed = now - parseInt(lastStamp);
        
        // Kalo udah lewat 7 menit
        if (timePassed > TIMEOUT_MS) {
          handleLogout();
        }
      }
    }, 1000); // Cek tiap 1 detik

    // Event listener buat reset timer
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    const eventHandler = () => updateActivity();

    events.forEach((event) => window.addEventListener(event, eventHandler));

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, eventHandler));
    };
  }, [status, updateActivity, handleLogout]);

  return null;
}