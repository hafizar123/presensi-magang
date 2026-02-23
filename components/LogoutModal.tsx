"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
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
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="!w-[72vw] sm:!w-full sm:!max-w-[380px] p-0 border-none bg-transparent shadow-none outline-none overflow-hidden">
        <div className="bg-white/95 dark:bg-[#0c0a09]/95 border border-slate-100 dark:border-[#292524] rounded-[2rem] p-6 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          <AlertDialogHeader className="flex flex-col items-center justify-center space-y-4 w-full">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-600">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-center w-full">
              <AlertDialogTitle className="text-lg sm:text-xl font-bold w-full">Konfirmasi Keluar</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs leading-relaxed w-full">
                Apakah Anda yakin ingin mengakhiri sesi akses pada sistem saat ini?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-8 w-full">
            <AlertDialogCancel className="w-full sm:flex-1 h-9 sm:h-11 rounded-xl text-[10px] sm:text-xs font-semibold m-0 order-2 sm:order-1 border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut({ callbackUrl: "/login" })} className="w-full sm:flex-1 h-9 sm:h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] sm:text-xs m-0 order-1 sm:order-2 shadow-lg shadow-red-600/10 border-none">Keluar</AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}