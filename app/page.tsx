"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LogOut, MapPin, Clock, Calendar, Briefcase, 
  AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AttendanceButton from "@/components/AttendanceButton";
import RealtimeClock from "@/components/RealtimeClock";
import LogoutModal from "@/components/LogoutModal";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State Lokasi & Absen
  const [locationName, setLocationName] = useState("Mencari lokasi...");
  const [todayLog, setTodayLog] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch Status Absen Hari Ini
  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const res = await fetch("/api/attendance/today");
        const data = await res.json();
        setTodayLog(data);
      } catch (error) {
        console.error("Gagal cek absen hari ini");
      }
    };
    if (session) fetchTodayLog();
  }, [session]);

  // Ambil Lokasi (Reverse Geocoding)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.county || "Yogyakarta";
          setLocationName(city);
        } catch (e) {
          setLocationName("Lokasi tidak terdeteksi");
        }
      }, () => setLocationName("Gagal ambil lokasi"));
    }
  }, []);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* HEADER BIRU KEREN */}
      <header className="relative bg-blue-600 dark:bg-blue-900 pt-8 pb-32 px-6 rounded-b-[2.5rem] shadow-xl shadow-blue-200 dark:shadow-none overflow-hidden">
        {/* Hiasan Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-20 -left-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="relative flex justify-between items-start z-10 max-w-md mx-auto">
          <div className="text-white space-y-1">
            <p className="text-blue-100 text-sm font-medium tracking-wide">Selamat Datang,</p>
            <h1 className="text-2xl font-bold tracking-tight drop-shadow-md">
              {session?.user?.name || "Anak Magang"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-blue-100/90 mt-2 bg-blue-500/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/30">
               <Briefcase className="h-3 w-3" />
               <span>Internship Program</span>
            </div>
          </div>

          <div className="flex gap-3">
            {/* LOGOUT BUTTON */}
            <LogoutModal>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-xl transition-all">
                    <LogOut className="h-5 w-5" />
                </Button>
            </LogoutModal>

            {/* --- AVATAR PROFILE (NAVIGASI KE HALAMAN EDIT) --- */}
            <div 
                onClick={() => router.push('/profile')} 
                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
                <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg ring-2 ring-transparent hover:ring-white/50">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=random&color=fff`} />
                    <AvatarFallback className="bg-blue-800 text-white font-bold">
                        {session?.user?.name?.substring(0, 2).toUpperCase() || "ME"}
                    </AvatarFallback>
                </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT DASHBOARD */}
      <main className="max-w-md mx-auto px-6 -mt-20 relative z-20 space-y-6">
        
        {/* Kartu Jam & Lokasi */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-800 w-fit mx-auto px-4 py-1.5 rounded-full">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 animate-bounce" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                        {locationName}
                    </span>
                </div>
                
                <RealtimeClock />

                <div className="pt-2">
                    <AttendanceButton />
                </div>
            </CardContent>
        </Card>

        {/* Status Hari Ini */}
        <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full mb-3 text-green-600 dark:text-green-400">
                        <Clock className="h-6 w-6" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jam Masuk</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {todayLog?.in ? todayLog.in.substring(0, 5) : "--:--"}
                    </p>
                </CardContent>
            </Card>
            <Card className="border-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-3 text-red-600 dark:text-red-400">
                        <LogOut className="h-6 w-6 ml-0.5" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jam Pulang</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {todayLog?.out ? todayLog.out.substring(0, 5) : "--:--"}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Menu Pilihan */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 px-1 flex items-center gap-2">
                Menu Aktivitas
            </h3>
            
            <div className="grid gap-3">
                <div 
                    onClick={() => router.push('/izin')}
                    className="group bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Ajukan Izin</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Sakit atau keperluan lain</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full">
                        <AlertCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    </div>
                </div>

                <div 
                    onClick={() => router.push('/riwayat')}
                    className="group bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Riwayat Absensi</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Cek log kehadiranmu</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full">
                        <AlertCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}