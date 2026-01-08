import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Users, UserCheck, Clock, CalendarDays } from "lucide-react";

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

const prisma = new PrismaClient();

// Ambil data intern dari DB
async function getDashboardData() {
  const interns = await prisma.user.findMany({
    where: { role: "INTERN" },
    include: { internProfile: true },
    orderBy: { createdAt: "desc" },
  });

  // Hitung statistik sederhana
  const totalInterns = interns.length;
  const activeInterns = interns.filter(u => u.internProfile).length; // Yg udah punya jadwal
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
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      
      {/* 1. Section Statistik (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Total */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Anak Magang
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalInterns}</div>
            <p className="text-xs text-slate-500 mt-1">
              Terdaftar di dalam sistem
            </p>
          </CardContent>
        </Card>

        {/* Card Aktif */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Sudah Diatur Jadwal
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeInterns}</div>
            <p className="text-xs text-slate-500 mt-1">
              Siap melakukan presensi
            </p>
          </CardContent>
        </Card>

        {/* Card Pending */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Belum Diatur
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingInterns}</div>
            <p className="text-xs text-slate-500 mt-1">
              Perlu setting jam kerja
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Tabel Utama */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Overview Peserta Magang</CardTitle>
          <CardDescription>
            Daftar terbaru anak magang. Klik tombol aksi untuk mengatur jadwal mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama Peserta</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Masa Magang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Belum ada data magang.
                  </TableCell>
                </TableRow>
              ) : (
                interns.map((intern, index) => (
                  <TableRow key={intern.id}>
                    <TableCell className="text-slate-500">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900">{intern.name}</span>
                        <span className="text-xs text-slate-400">Joined: {new Date(intern.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{intern.email}</TableCell>
                    <TableCell>
                      {intern.internProfile ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(intern.internProfile.startDate).toLocaleDateString('id-ID', {day:'numeric', month:'short'})} - 
                          {new Date(intern.internProfile.endDate).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'2-digit'})}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {intern.internProfile ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ScheduleDialog user={intern} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}