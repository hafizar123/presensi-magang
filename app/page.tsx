import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import DashboardClient from "@/components/DashboardClient"; 

const prisma = new PrismaClient();

// Data Fetching Logic (Tetap di Server)
async function getAnnouncements() {
  return await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5, 
  });
}

async function getTodayAttendance(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: today,
      },
    },
  });
}

async function getMonthlyStats(userId: string) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      userId: userId,
      date: { gte: firstDay }
    },
    _count: { status: true }
  });

  return stats;
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  // Fetch Data Paralel biar cepet
  const [announcements, todayLog, statsRaw] = await Promise.all([
    getAnnouncements(),
    getTodayAttendance(session.user.id),
    getMonthlyStats(session.user.id)
  ]);

  // Olah data stats dikit
  const countHadir = statsRaw.find(s => s.status === 'HADIR')?.['_count'].status || 0;
  const countTelat = statsRaw.find(s => s.status === 'TELAT')?.['_count'].status || 0;
  const countIzin = statsRaw.find(s => s.status === 'IZIN')?.['_count'].status || 0;
  
  const greetingHour = new Date().getHours();
  let greeting = "Selamat Pagi";
  if (greetingHour >= 11) greeting = "Selamat Siang";
  if (greetingHour >= 15) greeting = "Selamat Sore";
  if (greetingHour >= 19) greeting = "Selamat Malam";

  // Render Client Component dan oper datanya
  return (
    <DashboardClient 
      user={session.user}
      announcements={announcements}
      todayLog={todayLog}
      greeting={greeting}
      stats={{
        hadir: countHadir,
        telat: countTelat,
        izin: countIzin,
        total: countHadir + countTelat
      }}
    />
  );
}