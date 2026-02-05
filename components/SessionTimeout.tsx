"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SessionTimeout() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // State buat munculin popup
  const [isOpen, setIsOpen] = useState(false);

  // SETTING WAKTU: 7 Menit
  const TIMEOUT_MS = 7 * 60 * 1000; 
  const STORAGE_KEY = "lastTimeStamp";

  // Fungsi Logout (Dipanggil pas klik tombol "Login Ulang")
  const handleLogout = useCallback(() => {
    // Hapus data waktu
    localStorage.removeItem(STORAGE_KEY);
    
    // Logout dan arahkan ke login (TANPA query param aneh-aneh)
    signOut({ callbackUrl: "/login" }); 
  }, []);

  // Fungsi Update Waktu (Biar ga timeout kalo lagi aktif)
  const updateActivity = useCallback(() => {
    if (status === "authenticated" && !isOpen) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }, [status, isOpen]);

  // Logic Pengecekan Waktu
  useEffect(() => {
    if (status !== "authenticated") return;

    // Set waktu awal pas refresh/masuk
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    // Interval Checker (Jalan tiap detik)
    const interval = setInterval(() => {
      // Kalo popup udah muncul, gausah cek lagi (tunggu user klik)
      if (isOpen) return;

      const lastStamp = localStorage.getItem(STORAGE_KEY);
      if (lastStamp) {
        const now = Date.now();
        const timePassed = now - parseInt(lastStamp);
        
        // Kalo udah lewat 7 menit -> MUNCULIN POPUP
        if (timePassed > TIMEOUT_MS) {
          setIsOpen(true);
        }
      }
    }, 1000);

    // Event Listener (Mendeteksi gerakan mouse/keyboard)
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    
    // Throttle dikit biar enteng
    let timeoutId: NodeJS.Timeout;
    const eventHandler = () => {
        // Cuma update kalo popup BELUM muncul
        if (!isOpen && !timeoutId) {
            timeoutId = setTimeout(() => {
                updateActivity();
                // @ts-ignore
                timeoutId = null;
            }, 1000);
        }
    };

    events.forEach((event) => window.addEventListener(event, eventHandler));

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, eventHandler));
      if(timeoutId) clearTimeout(timeoutId);
    };
  }, [status, updateActivity, isOpen, TIMEOUT_MS]);

  // Kalo user belum login, ga usah render apa-apa
  if (status !== "authenticated") return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-white dark:bg-[#1c1c1e] border-none shadow-2xl max-w-sm rounded-2xl">
        <AlertDialogHeader className="items-center text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
             <LogOut className="h-10 w-10 text-red-600 dark:text-red-500" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-slate-800 dark:text-[#EAE7DD]">
            Sesi Telah Berakhir
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
            Waktu sesi Anda habis karena tidak ada aktivitas. Silakan login ulang untuk melanjutkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-xl transition-all shadow-md active:scale-95"
          >
            Login Ulang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}