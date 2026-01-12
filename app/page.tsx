import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { LogOut, MapPin, Bell, History, FileText } from "lucide-react";
import Link from "next/link";

// Components
import RealtimeClock from "@/components/RealtimeClock";
import AttendanceButton from "@/components/AttendanceButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";
import LogoutModal from "@/components/LogoutModal";

const prisma = new PrismaClient();

async function getAnnouncements() {
  return await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

async function getTodayAttendance(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: today,
      },
    },
  });
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const announcements = await getAnnouncements();
  const todayLog = await getTodayAttendance(session.user.id);

  let statusText = "Belum Absen";
  let statusColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
   
  if (todayLog) {
    if (todayLog.status === "HADIR") {
        statusText = "Sudah Absen Masuk";
        statusColor = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    } else if (todayLog.status === "TELAT") {
        statusText = "Absen Terlambat";
        statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    } else if (todayLog.status === "IZIN") {
        statusText = "Izin / Sakit";
        statusColor = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  }

  return (
    // BG Utama: Putih di Light, Gelap Banget di Dark
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
       
      {/* HEADER */}
      <header className="bg-blue-600 dark:bg-blue-900 text-white p-6 rounded-b-[2.5rem] shadow-xl shadow-blue-900/20 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            {/* --- BAGIAN INI YANG GUA TAMBAHIN LINK --- */}
            <Link href="/profile">
                <Avatar className="border-2 border-white/30 w-12 h-12 cursor-pointer transition-transform active:scale-95">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${session.user.name}&background=random`} />
                <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </Link>
            {/* ----------------------------------------- */}
            
            <div>
              <p className="text-blue-100 text-xs">Selamat Datang,</p>
              <h1 className="font-bold text-lg leading-tight">{session.user.name}</h1>
            </div>
          </div>
           
          {/* TOGGLE DARK MODE & LOGOUT */}
          <div className="flex items-center gap-2">
            {/* Bungkus toggle pake bg semi-transparan biar ikonnya keliatan jelas */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-0.5">
                <ModeToggle />
            </div>

            <LogoutModal>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-lg transition-colors">
                    <LogOut className="h-5 w-5" />
                </Button>
            </LogoutModal>
          </div>
        </div>

        {/* Status Card */}
        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider">Lokasi Kantor</p>
                    <p className="text-sm font-semibold">Disdikpora DIY</p>
                </div>
             </div>
             <Badge className={`${statusColor} hover:${statusColor} shadow-none transition-colors`}>
                {statusText}
             </Badge>
        </div>
      </header>

      <main className="px-6 -mt-6 relative z-10 space-y-6">
        
        {/* 1. JAM & TOMBOL ABSEN */}
        {/* Card: Putih di Light, Abu Gelap di Dark */}
        <Card className="shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden transition-colors">
            <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
                {/* Pastiin Text Jam jadi Putih pas Dark Mode */}
                <div className="dark:text-white transition-colors"> 
                    <RealtimeClock />
                </div>
                 
                <AttendanceButton 
                    disabled={!!todayLog} 
                    label={todayLog ? "Sudah Absen Hari Ini" : "Absen Masuk Sekarang"} 
                />

                <p className="text-xs text-slate-400 text-center max-w-[200px]">
                    Pastikan kamu berada di radius kantor untuk melakukan presensi.
                </p>
            </CardContent>
        </Card>

        {/* 2. PENGUMUMAN */}
        <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                Info Terbaru
            </h3>
             
            <div className="space-y-3">
                {announcements.length === 0 ? (
                    <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 text-sm">
                        Tidak ada pengumuman baru.
                    </div>
                ) : (
                    announcements.map((info) => (
                        <div key={info.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{info.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {info.content}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 text-right">
                                {new Date(info.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* 3. MENU CEPAT */}
        <div className="grid grid-cols-2 gap-4">
            <Link href="/riwayat">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-900 group transition-all">
                    <History className="h-6 w-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Riwayat Absen</span>
                </Button>
            </Link>
             
            <Link href="/izin">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-900 group transition-all">
                    <FileText className="h-6 w-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" /> 
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Ajukan Izin</span>
                </Button>
            </Link>
        </div>

      </main>
    </div>
  );
}