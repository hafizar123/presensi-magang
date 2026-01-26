import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import RiwayatClient from "@/components/RiwayatClient";

const prisma = new PrismaClient();

async function getAttendanceLogs(userId: string) {
  const data = await prisma.attendance.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      date: "desc", 
    },
  });

  // JURUS FIX: Convert Date object jadi String biar kebaca di Client
  return JSON.parse(JSON.stringify(data));
}

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const logs = await getAttendanceLogs(session.user.id);

  return (
    <RiwayatClient 
        user={session.user} 
        logs={logs} 
    />
  );
}