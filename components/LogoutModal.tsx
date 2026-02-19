"use client";

import { signOut } from "next-auth/react";
import { LogOut, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LogoutModal({ children }: { children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      
      {/* Container responsif: 95% di HP, mentok 425px di Laptop, lengkungan dinamis */}
      <AlertDialogContent className="w-[95vw] sm:max-w-[425px] p-6 sm:p-8 bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden gap-6">
        <AlertDialogHeader className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 shrink-0 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
             </div>
             <div className="space-y-1">
               <AlertDialogTitle className="text-slate-800 dark:text-[#EAE7DD] font-bold text-lg sm:text-xl leading-none">
                  Konfirmasi Logout
               </AlertDialogTitle>
             </div>
          </div>
          <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed m-0">
            Sesi Anda akan berakhir. Anda harus login kembali jika ingin mengakses sistem di lain waktu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Tombol responsif: Flex-col di HP, Flex-row di Laptop */}
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-2">
          <AlertDialogCancel className="w-full sm:w-auto h-12 sm:h-11 px-6 rounded-xl border-none bg-slate-100 dark:bg-[#292524] text-slate-700 dark:text-[#EAE7DD] hover:bg-slate-200 dark:hover:bg-[#3f2e26] font-bold transition-all m-0">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full sm:w-auto h-12 sm:h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 font-bold transition-all active:scale-95 m-0"
          >
            Ya, Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}