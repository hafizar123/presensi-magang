"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { Timer } from "lucide-react";
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
    if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, Date.now().toString());
    const interval = setInterval(() => {
      if (isOpen) return;
      const lastStamp = localStorage.getItem(STORAGE_KEY);
      if (lastStamp) {
        const now = Date.now();
        const timePassed = now - parseInt(lastStamp);
        if (timePassed > TIMEOUT_MS) setIsOpen(true);
      }
    }, 1000);
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    const eventHandler = () => { if (!isOpen) updateActivity(); };
    events.forEach((event) => window.addEventListener(event, eventHandler));
    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, eventHandler));
    };
  }, [status, updateActivity, isOpen, TIMEOUT_MS]);

  if (status !== "authenticated") return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="!w-[78vw] sm:!w-full sm:!max-w-[400px] p-0 border-none bg-transparent shadow-none outline-none overflow-hidden">
        <div className="relative bg-white/95 dark:bg-[#0c0a09]/95 border border-white/20 dark:border-[#292524] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl backdrop-blur-xl flex flex-col items-center overflow-hidden">
          <div className="absolute -top-16 -right-16 h-32 w-32 bg-[#99775C] blur-[60px] opacity-10 pointer-events-none"></div>
          <AlertDialogHeader className="flex flex-col items-center justify-center space-y-5 w-full">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-50 dark:bg-[#1c1917] rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm"><Timer className="h-8 w-8 text-[#99775C]" /></div>
            <div className="space-y-2 text-center w-full">
              <AlertDialogTitle className="text-xl sm:text-2xl font-bold w-full">Sesi Berakhir</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 dark:text-gray-400 text-[10px] sm:text-sm leading-relaxed w-full">
                Masa berlaku sesi Anda telah berakhir demi keamanan data. Silakan melakukan autentikasi ulang untuk melanjutkan.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 w-full flex justify-center">
            <AlertDialogAction onClick={handleLogout} className="w-full sm:flex-1 h-9 sm:h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] sm:text-xs m-0 order-1 sm:order-2 shadow-lg shadow-red-600/10 border-none">Autentikasi Ulang</AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}