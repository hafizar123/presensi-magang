import { PrismaClient } from "@prisma/client";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

// Fungsi get data absensi
async function getAttendanceLogs() {
  return await prisma.attendance.findMany({
    include: { user: true },
    orderBy: { date: "desc" },
    take: 100, // Ambil 100 terakhir aja biar ga berat
  });
}

export default async function RekapPage() {
  const logs = await getAttendanceLogs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Rekap Absensi</h1>
            <p className="text-slate-500">Monitoring kehadiran harian peserta magang.</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Kehadiran Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    Belum ada data absensi masuk.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.date).toLocaleDateString("id-ID", { weekday: 'long', day:'numeric', month:'long' })}</TableCell>
                    <TableCell className="font-medium">{log.user.name}</TableCell>
                    <TableCell>{log.time} WIB</TableCell>
                    <TableCell>
                        <Badge className={
                            log.status === "HADIR" ? "bg-green-100 text-green-700" :
                            log.status === "TELAT" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                        }>
                            {log.status}
                        </Badge>
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