"use client";

import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    // Update class header: bg-white -> dark:bg-slate-900, border juga disesuaiin
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 transition-colors duration-300">
      
      {/* Kiri */}
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
        Dashboard Overview
      </h2>

      {/* Kanan */}
      <div className="flex items-center gap-6">
        <ModeToggle />

        <button className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
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
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}