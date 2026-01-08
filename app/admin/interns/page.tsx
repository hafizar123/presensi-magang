import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ScheduleDialog from "@/components/ScheduleDialog"; // Kita pake lagi dialog jadwalnya

const prisma = new PrismaClient();

export default async function InternsDataPage() {
  const interns = await prisma.user.findMany({
    where: { role: "INTERN" },
    include: { internProfile: true },
    orderBy: { name: "asc" }, // Urutin abjad biar rapi
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Data Peserta Magang</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Master Data Magang</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Divisi/Posisi</TableHead>
                <TableHead>Durasi Magang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.map((intern, i) => (
                <TableRow key={intern.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{intern.name}<br/><span className="text-xs text-slate-500">{intern.email}</span></TableCell>
                  <TableCell>-</TableCell> {/* Nanti bisa ditambahin kolom Divisi di DB */}
                  <TableCell>
                    {intern.internProfile ? (
                      <span className="text-xs">
                        {new Date(intern.internProfile.startDate).toLocaleDateString()} - {new Date(intern.internProfile.endDate).toLocaleDateString()}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {intern.internProfile ? <Badge className="bg-green-600">Aktif</Badge> : <Badge variant="secondary">Pending</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <ScheduleDialog user={intern} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}