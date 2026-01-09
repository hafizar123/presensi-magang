"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { 
  LogOut, 
  Clock, 
  MapPin, 
  CalendarCheck, 
  User, 
  FileText, 
  AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [time, setTime] = useState(new Date());

  // Jam Digital Real-time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Tanggal Indonesia
  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit", 
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- NAVBAR ALA DIKPORA (Hijau Tua) --- */}
      <nav className="bg-[#1a4d2e] text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo Dinas */}
            <div className="bg-white p-1 rounded-full">
                <Image 
                  src="/logo-disdikpora.png" 
                  alt="Logo" 
                  width={32} 
                  height={32} 
                  className="h-8 w-8 object-contain"
                />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide">SIP-MAGANG</h1>
              <p className="text-[10px] text-yellow-400 font-medium tracking-wider">DIKPORA D.I. YOGYAKARTA</p>
            </div>
          </div>

          {/* User Profile Dropdown (Simplified) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-white">
                {session?.user?.name || "Mahasiswa Magang"}
              </p>
              <p className="text-xs text-green-200">Divisi IT Support</p>
            </div>
            <Avatar className="border-2 border-yellow-400 h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-green-700 hover:text-yellow-300"
              onClick={() => router.push("/api/auth/signout")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="bg-[#1a4d2e] pb-20 pt-6 px-4">
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Dashboard Presensi</h2>
                    <p className="text-green-100 text-sm">Selamat datang, semangat mengabdi untuk negeri!</p>
                </div>
                <Badge variant="outline" className="mt-4 md:mt-0 border-yellow-400 text-yellow-400 bg-green-900/50 px-4 py-1">
                    <CalendarCheck className="mr-2 h-3 w-3" />
                    {formattedDate}
                </Badge>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (Numpang di atas Hero) --- */}
      <main className="container mx-auto px-4 -mt-16 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KARTU 1: ABSENSI UTAMA (Gede) */}
          <Card className="md:col-span-2 shadow-xl border-t-4 border-t-yellow-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-700 flex items-center justify-between">
                    <span>Status Kehadiran</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                        Belum Absen
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-5xl md:text-7xl font-mono font-bold text-[#1a4d2e] tracking-widest mb-2">
                        {formattedTime}
                    </div>
                    <p className="text-slate-400 text-sm mb-8">Waktu Server Indonesia Barat (WIB)</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <Button className="h-12 bg-[#1a4d2e] hover:bg-[#143d24] text-white text-lg shadow-lg shadow-green-900/20">
                            <Clock className="mr-2 h-5 w-5" />
                            Absen Masuk
                        </Button>
                        <Button variant="outline" className="h-12 border-slate-300 text-slate-500 hover:bg-slate-50" disabled>
                            <LogOut className="mr-2 h-5 w-5" />
                            Absen Pulang
                        </Button>
                    </div>
                    
                    <div className="mt-6 flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        <MapPin className="mr-1 h-3 w-3 text-red-500" />
                        Lokasi: Dinas Dikpora DIY (Radius Terjangkau)
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* KARTU 2: STATISTIK RINGKAS */}
          <div className="space-y-6">
            <Card className="shadow-lg border-none bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#1a4d2e]">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold opacity-80">Total Hadir</p>
                        <h3 className="text-4xl font-bold">12</h3>
                        <p className="text-xs mt-1 font-medium">Hari bulan ini</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl">
                        <FileText className="h-8 w-8 text-[#1a4d2e]" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Terlambat</p>
                        <p className="text-2xl font-bold text-orange-500">2</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Alpha</p>
                        <p className="text-2xl font-bold text-red-500">0</p>
                    </CardContent>
                </Card>
            </div>
          </div>

        </div>

        {/* --- RIWAYAT TABLE --- */}
        <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-[#1a4d2e]" />
                Riwayat Presensi Minggu Ini
            </h3>
            <Card className="shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Jam Masuk</th>
                                <th className="px-6 py-3">Jam Pulang</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Senin, 12 Jan 2026</td>
                                <td className="px-6 py-4 text-green-600 font-medium">07:15 WIB</td>
                                <td className="px-6 py-4">16:05 WIB</td>
                                <td className="px-6 py-4">
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Tepat Waktu</Badge>
                                </td>
                            </tr>
                            <tr className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Selasa, 13 Jan 2026</td>
                                <td className="px-6 py-4 text-orange-500 font-medium">08:10 WIB</td>
                                <td className="px-6 py-4">16:00 WIB</td>
                                <td className="px-6 py-4">
                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Terlambat</Badge>
                                </td>
                            </tr>
                            <tr className="bg-white hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">Rabu, 14 Jan 2026</td>
                                <td className="px-6 py-4">-</td>
                                <td className="px-6 py-4">-</td>
                                <td className="px-6 py-4">
                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Alpha</Badge>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

      </main>
    </div>
  );
}