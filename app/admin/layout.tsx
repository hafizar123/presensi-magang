"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default true biar di server rendering gak layout shift aneh
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Effect buat deteksi layar pas pertama load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setSidebarOpen(false); // HP default tutup
      } else {
        setIsMobile(false);
        setSidebarOpen(true); // Desktop default buka
      }
    };

    // Jalanin sekali pas mount
    handleResize();

    // Dengerin kalo user resize browser
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Sidebar - Kirim status open/close */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Konten Utama Wrapper */}
      {/* Logic: Kalo sidebar buka di desktop, kasih padding kiri 64 (16rem). Kalo tutup, 0. */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          sidebarOpen && !isMobile ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        
        {/* Header - Kirim status juga buat ngatur lebar/posisi dia */}
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <main className="pt-20 p-4 md:p-8 flex-1">
            {children}
        </main>
      </div>
    </div>
  );
}