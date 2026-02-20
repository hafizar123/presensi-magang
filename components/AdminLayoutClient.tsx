"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  Bell,
  FileSpreadsheet,
  UserCog,
  Briefcase,
  Star // Icon buat penilaian
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";
import LogoutModal from "@/components/LogoutModal";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: any; 
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/interns", label: "Data Magang", icon: Briefcase },
    { href: "/admin/rekap", label: "Rekap Presensi", icon: FileSpreadsheet },
    { href: "/admin/izin", label: "Validasi Izin", icon: FileText },
    { href: "/admin/announcements", label: "Pengumuman", icon: Bell },
    { href: "/admin/users", label: "Manajemen User", icon: UserCog },
    { href: "/admin/penilaian", label: "Penilaian Magang", icon: Star },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  // --- INI YANG GUA UBAH JADI VARIABEL JSX (Huruf kecil & ga pake () => ) ---
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#EAE7DD] dark:bg-[#0c0a09] border-r border-[#d6d3c9] dark:border-[#1c1917] transition-colors duration-300">
        <div className="h-16 flex items-center gap-3 px-6 bg-[#99775C] dark:bg-[#271c19] text-white border-b border-[#8a6b52] dark:border-[#3f2e26]">
             <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg tracking-tight">SIP-MAGANG</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Menu Admin</h4>
            
            {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group
                            ${active 
                                ? "bg-[#99775C] dark:bg-[#3f2e26] text-white font-bold shadow-md" 
                                : "text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-[#99775C]/10 dark:hover:bg-white/5 hover:text-[#99775C] dark:hover:text-white font-medium"
                            }
                        `}
                    >
                        <item.icon className={`h-5 w-5 ${active ? "" : "group-hover:text-[#99775C] dark:group-hover:text-white transition-colors"}`} /> 
                        {item.label}
                    </Link>
                )
            })}

            <div className="mt-6 border-t border-[#d6d3c9] dark:border-white/10 pt-4">
                <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Akun</h4>
                
                {isMounted ? (
                    <LogoutModal>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-colors text-left">
                            <LogOut className="h-5 w-5" /> Keluar Aplikasi
                        </button>
                    </LogoutModal>
                ) : (
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-colors text-left">
                        <LogOut className="h-5 w-5" /> Keluar Aplikasi
                    </button>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#0c0a09] font-sans transition-colors duration-300">
      
      <nav className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white transition-colors">
                <Menu className="h-6 w-6" />
             </Button>

             {isMounted ? (
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white transition-colors">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px] border-none bg-transparent shadow-none">
                        {/* MANGGILNYA DI SINI */}
                        {sidebarContent}
                    </SheetContent>
                 </Sheet>
             ) : (
                 <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white transition-colors">
                    <Menu className="h-6 w-6" />
                 </Button>
             )}

             <h1 className="font-bold text-xl text-white">Panel Admin</h1>
          </div>
          <div className="flex items-center gap-3 text-white">
            <ModeToggle />
            <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
            <div className="flex items-center gap-3 pl-1 group cursor-default">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold transition-colors">{user?.name || "Admin"}</span>
                    <span className="text-[10px] text-[#EAE7DD]/80 font-medium">Administrator</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-white/20 transition-colors">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className="bg-[#5c4a3d] text-white">A</AvatarFallback>
                </Avatar>
            </div>
          </div>
      </nav>

      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* MANGGILNYA DI SINI JUGA */}
        {sidebarContent}
      </aside>

      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        {children}
      </main>
    </div>
  );
}