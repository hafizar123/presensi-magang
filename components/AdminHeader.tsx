"use client";

import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      {/* Kiri: Judul Halaman (Bisa dibikin dinamis nanti) */}
      <h2 className="text-lg font-semibold text-slate-700">Dashboard Overview</h2>

      {/* Kanan: Profil */}
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}