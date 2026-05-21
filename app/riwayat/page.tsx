import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RiwayatClient from "@/components/RiwayatClient";

async function getAttendanceLogs(userId: string) {
  const data = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const [logs, userFromDb] = await Promise.all([
    getAttendanceLogs(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, divisi: true, nomorInduk: true }
    })
  ]);

  return (
    <RiwayatClient 
        user={userFromDb || session.user} 
        logs={logs} 
    />
  );
}