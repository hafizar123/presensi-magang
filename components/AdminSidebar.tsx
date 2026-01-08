"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  UserCog,
  Megaphone
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/admin", 
      icon: LayoutDashboard 
    },
    { 
      name: "Manajemen User", 
      href: "/admin/users", 
      icon: UserCog 
    },
    { 
      name: "Data Magang", 
      href: "/admin/interns", 
      icon: Users 
    },
    { 
      name: "Rekap Absensi", 
      href: "/admin/rekap", 
      icon: FileText 
    },
    { 
      name: "Pengumuman", 
      href: "/admin/announcements", 
      icon: Megaphone 
    },
    { 
      name: "Pengaturan", 
      href: "/admin/settings", 
      icon: Settings 
    },
  ];

  return (
    <aside className="h-screen w-64 bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50">
      
      {/* 1. Logo Section */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-[#0f172a]">
        <div className="bg-white p-1 rounded-md flex items-center justify-center">
          {/* Pastiin file logo ada di public folder */}
          <Image 
            src="/logo-disdikpora.png" 
            alt="Logo" 
            width={24} 
            height={24} 
            className="w-6 h-6 object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide">ADMIN PANEL</h1>
          <p className="text-[10px] text-slate-400">Presensi Magang</p>
        </div>
      </div>

      {/* 2. Menu Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <p className="px-4 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}