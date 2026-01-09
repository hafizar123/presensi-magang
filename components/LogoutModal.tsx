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
        {/* Tombol pemicu (apapun yang di-wrap) */}
        {children}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-sm rounded-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
             </div>
             <AlertDialogTitle className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                Konfirmasi Logout
             </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pl-[3.25rem]">
            Sesi anda akan berakhir di sini, anda harus login kembali jika ingin masuk sistem nanti. Yakin ingin logout?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-lg border-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 font-bold"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}