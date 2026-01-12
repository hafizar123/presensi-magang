"use client";

import Link from "next/link";
import Image from "next/image"; // <--- JANGAN LUPA IMPORT INI
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Megaphone, 
  Settings, 
  LogOut, 
  ClipboardList 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutModal from "@/components/LogoutModal";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Manajemen User", icon: Users },
    { href: "/admin/interns", label: "Data Magang", icon: ClipboardList },
    { href: "/admin/rekap", label: "Rekap Absensi", icon: FileText },
    { href: "/admin/izin", label: "Approval Izin", icon: FileText },
    { href: "/admin/announcements", label: "Pengumuman", icon: Megaphone },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 border-r border-slate-800">
      
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
        
        <div className="relative h-10 w-10 mr-3 flex-shrink-0">
            <Image 
                src="/logo-disdikpora.png" 
                alt="Logo Disdikpora DIY"
                fill // Pake fill biar dia ngikutin ukuran h-10 w-10 parent-nya
                sizes="40px"
                className="object-contain" // Biar gambar gak gepeng/kepotong
            />
        </div>
        
        {/* Teks */}
        <div className="flex flex-col justify-center">
            <span className="font-bold text-lg tracking-wider leading-none text-white">
                Dinas DIKPORA
            </span>
        </div>
      </div>

      {/* MENU LIST */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Menu Utama</p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-1 transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 hover:bg-blue-700" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT BUTTON (MODAL) */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <LogoutModal>
            <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors group"
            >
                <LogOut className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Logout
            </Button>
        </LogoutModal>
      </div>

    </aside>
  );
}