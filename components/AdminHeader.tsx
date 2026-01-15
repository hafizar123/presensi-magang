"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type NotificationItem = {
  id: string; // ID Asli DB (buat dikirim balik ke API)
  displayId: string; // ID Unik buat React Key
  type: "IZIN" | "USER";
  title: string;
  message: string;
  link: string;
  time: string;
};

export default function AdminHeader() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fungsi ambil notif
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Gagal ambil notif");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Hapus Notif PERMANEN (Lapor ke API)
  const handleClearNotifications = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Optimistic Update (Ilangin duluan biar cepet di mata user)
    const itemsToDismiss = notifications.map(n => ({ id: n.id, type: n.type }));
    setNotifications([]); 

    try {
        // Kirim request ke backend buat nyatet di 'Blacklist Notif'
        await fetch("/api/admin/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: itemsToDismiss })
        });
    } catch (error) {
        console.error("Gagal sync dismiss");
        fetchNotifications(); // Kalo gagal, balikin lagi datanya
    }
  };

  // Ambil notif pas pertama load
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 transition-colors duration-300">
      
      {/* Kiri */}
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
        Dashboard Overview
      </h2>

      {/* Kanan */}
      <div className="flex items-center gap-6">
        <ModeToggle />

        {/* --- NOTIFICATION BELL --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <Bell className="h-5 w-5" />
              
              {/* Red Dot Indicator */}
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
            <DropdownMenuLabel className="font-bold text-slate-900 dark:text-slate-100 flex justify-between items-center">
                Notifikasi
                {notifications.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-none">
                        {notifications.length} Baru
                    </Badge>
                )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            
            <div className="max-h-[300px] overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-xs text-slate-500">Memuat notifikasi...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bersih!</p>
                        <p className="text-xs text-slate-400">Tidak ada notifikasi baru.</p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <Link href={item.link} key={item.displayId} className="cursor-pointer">
                            <DropdownMenuItem className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                <div className="flex gap-3 items-start">
                                    <div className={`p-2 rounded-full mt-0.5 ${item.type === 'IZIN' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                        <AlertCircle className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {item.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {new Date(item.time).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </Link>
                    ))
                )}
            </div>
            
            {/* TOMBOL DELETE / CLEAR NOTIFIKASI */}
            {notifications.length > 0 && (
                <>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <div className="p-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleClearNotifications}
                        >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Hapus Semua Notifikasi
                        </Button>
                    </div>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Profile Info */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 transition-colors">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Super Admin
            </p>
          </div>
          <Avatar>
            <AvatarImage src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Admin'}&background=0D8ABC&color=fff`} />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}