import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { 
  Users, Clock, FileText, CheckCircle2, Activity,
  ArrowUpRight, MapPin
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // 1. STATS LOGIC
  const totalInterns = await prisma.user.count({ where: { role: "INTERN" } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const hadirToday = await prisma.attendance.count({
    where: { date: { gte: today, lt: tomorrow }, status: "HADIR" },
  });
  
  const telatToday = await prisma.attendance.count({
    where: { date: { gte: today, lt: tomorrow }, status: "TELAT" },
  });

  const izinPending = await prisma.leaveRequest.count({
    where: { status: "PENDING" },
  });

  // 2. FETCH DATA UNTUK TABEL
  const recentAttendance = await prisma.attendance.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const recentLeaves = await prisma.leaveRequest.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  // Gabungin & Sortir
  const activities = [
    ...recentAttendance.map(a => ({
        id: a.id,
        user: a.user,
        activity: a.status === 'HADIR' ? 'Presensi Masuk' : 'Terlambat',
        detail: a.status === 'HADIR' ? 'Hadir Tepat Waktu' : 'Absen melebihi jam masuk',
        time: a.createdAt,
        type: 'ATTENDANCE',
        status: a.status 
    })),
    ...recentLeaves.map(l => ({
        id: l.id,
        user: l.user,
        activity: 'Pengajuan Izin',
        detail: l.reason,
        time: l.createdAt,
        type: 'LEAVE',
        status: l.status 
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 7); 

  return (
    <div className="space-y-8">
      {/* SECTION 1: HEADER & STATS */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-[#EAE7DD]">Dashboard Overview</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-1">Ringkasan aktivitas sistem presensi hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard title="Total Peserta" value={totalInterns} icon={Users} desc="PKL Aktif" color="text-blue-600 dark:text-blue-400" />
        <AdminStatsCard title="Hadir Hari Ini" value={hadirToday} icon={CheckCircle2} desc="Tepat Waktu" color="text-green-600 dark:text-green-400" />
        <AdminStatsCard title="Terlambat" value={telatToday} icon={Clock} desc="Melewati Batas Waktu" color="text-orange-600 dark:text-orange-400" />
        <AdminStatsCard title="Pengajuan Izin" value={izinPending} icon={FileText} desc="Menunggu Persetujuan" color="text-red-600 dark:text-red-400" />
      </div>

      {/* SECTION 2: TABEL AKTIVITAS TERBARU (RAPID & KALCER) */}
      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] py-5 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#99775C]" /> Aktivitas Terbaru
                </CardTitle>
                <Link href="/admin/rekap">
                    <Button variant="ghost" size="sm" className="text-[#99775C] hover:text-[#7a5e48] hover:bg-[#99775C]/10 font-bold">
                        Lihat Semua <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
            {/* WRAPPER SCROLL */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                
                {/* MIN-WIDTH BIAR KOLOM GAK GEPENG */}
                <Table className="min-w-[1000px]">
                    <TableHeader className="bg-[#99775C]">
                        <TableRow className="border-none hover:bg-[#99775C]">
                            <TableHead className="w-[60px] text-white font-bold text-center pl-6">No</TableHead>
                            <TableHead className="text-white font-bold min-w-[250px]">Nama Peserta</TableHead>
                            <TableHead className="text-white font-bold min-w-[200px]">Email</TableHead>
                            <TableHead className="text-white font-bold min-w-[150px]">Aktivitas</TableHead>
                            <TableHead className="text-white font-bold min-w-[200px]">Detail / Alasan</TableHead>
                            <TableHead className="text-white font-bold text-right pr-6 min-w-[150px]">Waktu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    Belum ada aktivitas tercatat.
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((item, index) => (
                                <TableRow key={item.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524] transition-colors group">
                                    
                                    {/* NO */}
                                    <TableCell className="text-center font-medium text-slate-500 pl-6">
                                        {index + 1}
                                    </TableCell>

                                    {/* PESERTA (NAMA + AVATAR) */}
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-white dark:border-[#292524] shadow-sm">
                                                <AvatarImage src={item.user.image || ""} />
                                                <AvatarFallback className="bg-[#99775C] text-white font-bold text-xs">{item.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-slate-800 dark:text-[#EAE7DD]">{item.user.name}</span>
                                        </div>
                                    </TableCell>

                                    {/* EMAIL */}
                                    <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {item.user.email}
                                    </TableCell>

                                    {/* AKTIVITAS (BADGE) */}
                                    <TableCell className="whitespace-nowrap">
                                        {item.type === 'ATTENDANCE' ? (
                                            item.status === 'HADIR' ? 
                                                <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-200 font-bold px-3">Presensi Masuk</Badge> : 
                                                <Badge className="bg-orange-100 text-orange-700 border-none hover:bg-orange-200 font-bold px-3">Terlambat</Badge>
                                        ) : (
                                            <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-200 font-bold px-3">Pengajuan Izin</Badge>
                                        )}
                                    </TableCell>

                                    {/* DETAIL */}
                                    <TableCell className="text-slate-600 dark:text-gray-400 text-sm max-w-[200px] truncate">
                                        {item.detail}
                                    </TableCell>

                                    {/* WAKTU */}
                                    <TableCell className="text-right pr-6 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500">
                                            <Clock className="h-3 w-3 text-[#99775C]" />
                                            {item.time.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} • {item.time.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminStatsCard({ title, value, icon: Icon, desc, color }: any) {
  return (
    <Card className="shadow-sm border-slate-200 dark:border-[#292524] bg-white dark:bg-[#1c1917] relative overflow-hidden h-auto min-h-[140px] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Icon className={`w-24 h-24 ${color}`} /></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-gray-400">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent className="relative z-10 pb-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-[#EAE7DD]">{value}</div>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{desc}</p>
        </CardContent>
    </Card>
  )
}