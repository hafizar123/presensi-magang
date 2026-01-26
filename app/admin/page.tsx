import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { 
  Users, Clock, FileText, CheckCircle2, Activity 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // 1. STATS LOGIC (SAMA KAYA KEMAREN)
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

  // 2. FETCH RECENT ACTIVITY (GABUNGAN ATTENDANCE & IZIN)
  const recentAttendance = await prisma.attendance.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const recentLeaves = await prisma.leaveRequest.findMany({
    take: 2,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  // Gabungin data biar jadi satu list aktivitas
  const activities = [
    ...recentAttendance.map(a => ({
        id: a.id,
        user: a.user,
        type: a.status === 'HADIR' ? 'Hadir Tepat Waktu' : 'Terlambat',
        time: a.createdAt,
        statusColor: a.status === 'HADIR' ? 'text-green-600' : 'text-orange-600'
    })),
    ...recentLeaves.map(l => ({
        id: l.id,
        user: l.user,
        type: 'Mengajukan Izin',
        time: l.createdAt,
        statusColor: 'text-blue-600'
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-[#EAE7DD]">Dashboard Overview</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-1">Ringkasan aktivitas sistem presensi hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard title="Total Peserta" value={totalInterns} icon={Users} desc="Mahasiswa Aktif" color="text-blue-600 dark:text-blue-400" />
        <AdminStatsCard title="Hadir Hari Ini" value={hadirToday} icon={CheckCircle2} desc="Tepat Waktu" color="text-green-600 dark:text-green-400" />
        <AdminStatsCard title="Terlambat" value={telatToday} icon={Clock} desc="Perlu Perhatian" color="text-orange-600 dark:text-orange-400" />
        <AdminStatsCard title="Pengajuan Izin" value={izinPending} icon={FileText} desc="Menunggu Persetujuan" color="text-red-600 dark:text-red-400" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#99775C]" /> Aktivitas Terbaru
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-4">Belum ada aktivitas.</div>
                    ) : (
                        activities.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524] transition-colors">
                                <Avatar className="h-10 w-10 border border-[#99775C]/20">
                                    <AvatarImage src={item.user.image || ""} />
                                    <AvatarFallback className="bg-[#99775C] text-white">{item.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-[#EAE7DD]">{item.user.name}</p>
                                    <p className={`text-xs font-medium ${item.statusColor}`}>{item.type}</p>
                                </div>
                                <div className="text-xs text-slate-400">
                                    {new Date(item.time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
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