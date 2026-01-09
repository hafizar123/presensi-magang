import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

async function getHistory(userId: string) {
  // Ambil 30 data terakhir aja biar ga berat
  return await prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30, 
  });
}

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const logs = await getHistory(session.user.id);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header Simple */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-full bg-white">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Riwayat Presensi</h1>
          <p className="text-xs text-slate-500">30 Hari Terakhir</p>
        </div>
      </div>

      {/* List Card Absensi */}
      <div className="space-y-3">
        {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
                Belum ada data absen bro.
            </div>
        ) : (
            logs.map((log) => (
            <Card key={log.id} className="border-slate-200 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                            {new Date(log.date).toLocaleDateString("id-ID", { weekday: 'long', day:'numeric', month:'short' })}
                        </h4>
                        <p className="text-xs text-slate-500">
                            Pukul {log.time} WIB
                        </p>
                    </div>
                </div>
                <Badge className={
                    log.status === "HADIR" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                    log.status === "TELAT" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                    "bg-red-100 text-red-700 hover:bg-red-100"
                }>
                    {log.status}
                </Badge>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}