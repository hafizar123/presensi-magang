import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { 
  Users, 
  UserCheck, 
  Clock, 
  CalendarDays, 
  LayoutDashboard, 
  Mail,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

// Components
import ScheduleDialog from "@/components/ScheduleDialog"; 
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

// Ambil data intern dari DB
async function getDashboardData() {
  const interns = await prisma.user.findMany({
    where: { role: "INTERN" },
    include: { internProfile: true },
    orderBy: { createdAt: "desc" },
    take: 5 // Cuma ambil 5 terbaru buat preview dashboard
  });

  const allInterns = await prisma.user.findMany({ where: { role: "INTERN" }, include: { internProfile: true } });

  // Hitung statistik
  const totalInterns = allInterns.length;
  const activeInterns = allInterns.filter(u => u.internProfile).length; 
  const pendingInterns = totalInterns - activeInterns;

  return { interns, totalInterns, activeInterns, pendingInterns };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { interns, totalInterns, activeInterns, pendingInterns } = await getDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Selamat datang kembali, pantau aktivitas magang hari ini.</p>
      </div>
      
      {/* 1. Section Statistik (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Total */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Users className="w-24 h-24 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Anak Magang
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalInterns}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Terdaftar di dalam sistem
            </p>
          </CardContent>
        </Card>

        {/* Card Aktif */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <UserCheck className="w-24 h-24 text-green-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Sudah Diatur Jadwal
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{activeInterns}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Siap melakukan presensi
            </p>
          </CardContent>
        </Card>

        {/* Card Pending */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Clock className="w-24 h-24 text-orange-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Belum Diatur
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{pendingInterns}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Perlu setting jam kerja
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Tabel Utama */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Overview Peserta Magang
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                    5 Pendaftar terbaru.
                </CardDescription>
            </div>
            <Link href="/admin/interns">
                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px] text-slate-700 dark:text-slate-300 pl-6">No</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Nama Peserta</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Email</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Masa Magang</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500 dark:text-slate-400">
                    Belum ada data magang.
                  </TableCell>
                </TableRow>
              ) : (
                interns.map((intern, index) => (
                  <TableRow key={intern.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="text-slate-500 dark:text-slate-400 pl-6">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-slate-200 font-semibold">{intern.name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Joined: {new Date(intern.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="text-sm">{intern.email}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      {intern.internProfile ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(intern.internProfile.startDate).toLocaleDateString('id-ID', {day:'numeric', month:'short'})} - 
                          {new Date(intern.internProfile.endDate).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'2-digit'})}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {intern.internProfile ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ScheduleDialog user={intern} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="text-xs text-slate-400 dark:text-slate-600 text-center pt-10 border-t border-slate-100 dark:border-slate-800/50 mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}