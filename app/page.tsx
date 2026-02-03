import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import DashboardClient from "@/components/DashboardClient"; 

const prisma = new PrismaClient();

async function getAnnouncements() {
  return await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5, 
  });
}

async function getTodayAttendance(userId: string) {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (7 * 3600000));
  
  wibTime.setHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(wibTime.getTime() - (7 * 3600000));
  const endOfDayUTC = new Date(startOfDayUTC.getTime() + (24 * 60 * 60 * 1000));

  return await prisma.attendance.findFirst({
    where: {
      userId: userId,
      date: { gte: startOfDayUTC, lt: endOfDayUTC }
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

// TAMBAHAN: Ambil Profile User Lengkap (termasuk periode)
async function getUserProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: { internProfile: true }
    });
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const [announcements, todayLog, statsRaw, userProfile] = await Promise.all([
    getAnnouncements(),
    getTodayAttendance(session.user.id),
    getMonthlyStats(session.user.id),
    getUserProfile(session.user.id)
  ]);

  const countHadir = statsRaw.find(s => s.status === 'HADIR')?.['_count'].status || 0;
  const countTelat = statsRaw.find(s => s.status === 'TELAT')?.['_count'].status || 0;
  const countIzin = statsRaw.find(s => s.status === 'IZIN')?.['_count'].status || 0;
  
  const greetingHour = new Date().getHours();
  let greeting = "Selamat Pagi";
  if (greetingHour >= 11) greeting = "Selamat Siang";
  if (greetingHour >= 15) greeting = "Selamat Sore";
  if (greetingHour >= 19) greeting = "Selamat Malam";

  return (
    <DashboardClient 
      user={userProfile || session.user} // Kirim user yang ada internProfile-nya
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