"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  
  const [isOpen, setIsOpen] = useState(false);

  const TIMEOUT_MS = 30 * 60 * 1000; 
  const STORAGE_KEY = "lastTimeStamp";

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    signOut({ callbackUrl: "/login" }); 
  }, []);

  const updateActivity = useCallback(() => {
    if (status === "authenticated" && !isOpen) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }, [status, isOpen]);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    const interval = setInterval(() => {
      if (isOpen) return;

      const lastStamp = localStorage.getItem(STORAGE_KEY);
      if (lastStamp) {
        const now = Date.now();
        const timePassed = now - parseInt(lastStamp);
        
        if (timePassed > TIMEOUT_MS) {
          setIsOpen(true);
        }
      }
    }, 1000);

    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    
    let timeoutId: NodeJS.Timeout;
    const eventHandler = () => {
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

  if (status !== "authenticated") return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="w-[95vw] sm:max-w-[400px] p-6 sm:p-8 bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] gap-6">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
          
          {/* Icon dengan efek ping/denyut di belakangnya */}
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full animate-ping"></div>
             <LogOut className="h-8 w-8 text-red-600 dark:text-red-500 relative z-10 ml-1" />
          </div>
          
          <div className="space-y-2">
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">
              Sesi Berakhir
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm sm:text-base px-2 sm:px-4">
              Waktu sesi habis karena tidak ada aktivitas. Silakan login ulang untuk melanjutkan.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="w-full mt-2">
          <AlertDialogAction 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-base m-0"
          >
            Login Ulang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}