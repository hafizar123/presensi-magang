import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ScheduleDialog from "@/components/ScheduleDialog"; 
import { CalendarDays, Briefcase, User } from "lucide-react"; // Nambah ikon dikit biar manis

const prisma = new PrismaClient();

export default async function InternsDataPage() {
  const interns = await prisma.user.findMany({
    where: { role: "INTERN" },
    include: { internProfile: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Data Peserta Magang</h1>
        <p className="text-slate-500 dark:text-slate-400">Database lengkap seluruh anak magang.</p>
      </div>
      
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Master Data Magang
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px] text-slate-700 dark:text-slate-300 pl-6">No</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Nama Lengkap</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Divisi/Posisi</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Durasi Magang</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 dark:text-slate-400">
                        Belum ada data peserta magang.
                    </TableCell>
                </TableRow>
              ) : (
                interns.map((intern, i) => (
                    <TableRow key={intern.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="text-slate-500 dark:text-slate-400 pl-6">{i + 1}</TableCell>
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-slate-200">{intern.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-500">{intern.email}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Briefcase className="h-3 w-3" />
                            <span className="italic">-</span> {/* Nanti ganti kolom Divisi */}
                        </div>
                    </TableCell>
                    <TableCell>
                        {intern.internProfile ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(intern.internProfile.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - 
                            {new Date(intern.internProfile.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">-</span>
                        )}
                    </TableCell>
                    <TableCell>
                        {intern.internProfile ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                Aktif
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