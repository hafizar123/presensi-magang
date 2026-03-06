import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1c1917] relative overflow-hidden p-6">
      
      {/* Background ala-ala dikpora biar senada sama login */}
      <div className="absolute inset-0 z-0">
          <Image 
              src="/bkgdikpora.jpg" 
              alt="Background" 
              fill 
              className="object-cover opacity-20 blur-sm scale-105"
              priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-[#0c0a09]/80" />
      </div>

      {/* Container buat konten */}
      <div className="relative z-10 max-w-3xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo Section - Background dibabat biar polos menyatu alam */}
        <div className="flex justify-center mb-6">
            <Image 
              src="/logo-disdikpora.png" 
              alt="Logo Disdikpora" 
              width={110} 
              height={110} 
              className="drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
        </div>

        {/* Hero Copywriting */}
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-[#EAE7DD] drop-shadow-sm">
          Sistem Presensi <span className="text-[#99775C]">Magang</span>
        </h1>
        
        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
        Portal resmi pencatatan presensi dan rekapitulasi kegiatan magang. Masuk ke dalam sistem untuk mengelola kehadiran dan melaporkan aktivitas Anda secara efisien dan terintegrasi.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#99775C] hover:bg-[#7a5e48] text-white font-bold transition-all shadow-lg shadow-[#99775C]/20 transform hover:-translate-y-0.5 active:scale-95"
          >
            Masuk Sistem 
          </Link>
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-transparent hover:bg-white/5 text-[#EAE7DD] font-bold border border-white/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            Buat Akun
          </Link>
        </div>

      </div>

      <footer className="absolute bottom-6 text-xs text-white/30 font-medium z-10">
        © 2026 SIP-MAGANG Disdikpora DIY by IF UPNVY
      </footer>
    </div>
  );
}