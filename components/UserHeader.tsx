"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Home, AlertTriangle } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserHeader() {
  const { data: session } = useSession();
  
  // State khusus buat modal logout
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#1c1917] border-b border-slate-200 dark:border-[#292524] flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 transition-colors">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-[#EAE7DD]">
          <Home className="text-[#99775C] w-5 h-5" />
          <span>Magang<span className="text-[#99775C]">App</span></span>
        </div>

        {/* Menu Tengah */}
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#99775C] dark:hover:text-[#99775C] transition-colors">Dashboard</Link>
          <Link href="/riwayat" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#99775C] dark:hover:text-[#99775C] transition-colors">Riwayat</Link>
          <Link href="/izin" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#99775C] dark:hover:text-[#99775C] transition-colors">Izin</Link>
        </nav>

        {/* Kanan: Profil & Mode */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-9 w-9 p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#99775C]">
                <Avatar className="h-9 w-9 transition-transform hover:scale-105 border-2 border-slate-100 dark:border-[#292524]">
                  <AvatarImage src={session?.user?.name ? `https://ui-avatars.com/api/?name=${session.user.name}&background=random` : undefined} />
                  <AvatarFallback className="bg-[#99775C] text-white font-bold">U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-xl border-slate-200 dark:border-[#3f2e26] bg-white dark:bg-[#1c1917]">
              <DropdownMenuLabel className="py-3">
                  <p className="font-bold text-slate-800 dark:text-[#EAE7DD] truncate">{session?.user?.name || 'Loading...'}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium truncate">{session?.user?.email}</p>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#292524]" />
              
              <div className="p-1">
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-[#292524] dark:focus:bg-[#292524] rounded-xl transition-colors">
                    <Link href="/profile" className="flex items-center w-full py-2">
                      <User className="mr-2 h-4 w-4 text-slate-500" /> 
                      <span className="font-bold text-slate-700 dark:text-slate-200">Edit Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-[#292524] my-1" />
                  
                  {/* 🔥 INI DIA OBATNYA Morns 🔥 */}
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      // KITA KASIH JEDA 150ms biar Dropdown nutup dulu, baru Modal nongol
                      // Jadi mereka kaga rebutan fokus layar lagi!
                      setTimeout(() => {
                        setIsLogoutOpen(true);
                      }, 150);
                    }} 
                    className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30 dark:focus:text-red-500 font-bold rounded-xl py-2 mt-1 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 🔥 MODAL LOGOUT SUPER KALCER & RESPONSIF 🔥 */}
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-[425px] p-6 sm:p-8 bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden gap-6 z-[99999]">
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
    </>
  );
}