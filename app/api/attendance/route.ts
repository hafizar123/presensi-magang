import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Helper: Ambil jam sekarang WIB
function getCurrentTimeWIB() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-GB", options).format(date); 
}

// Helper: Ambil tanggal hari ini WIB
function getTodayDateWIB() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  };
  const wibString = new Intl.DateTimeFormat("en-US", options).format(date);
  return new Date(wibString);
}

// Helper: Cek Hari (0 = Minggu, 6 = Sabtu)
function getDayIndexWIB() {
  const date = new Date();
  // Konversi ke WIB dulu
  const wibDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return wibDate.getDay(); 
}

// Helper: Convert "HH:mm" ke Total Menit
function timeToMinutes(time: string) {
  if (!time || typeof time !== "string") return 0;
  const clean = time.trim().replace(/[^0-9:]/g, "");
  const [hStr, mStr] = clean.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return (h * 60) + m;
}

// Helper: Baca Settings
function getGlobalSettings() {
  // Tambahin default endHourFriday
  let settings = { startHour: "07:30", endHour: "16:00", endHourFriday: "14:30" }; 
  try {
    const configPath = path.join(process.cwd(), "settings.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.startHour) settings.startHour = parsed.startHour;
      if (parsed.endHour) settings.endHour = parsed.endHour;
      if (parsed.endHourFriday) settings.endHourFriday = parsed.endHourFriday;
    }
  } catch (error) {
    console.error("Gagal baca settings, pake default:", error);
  }
  return settings;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 1. CEK USER & PERIODE
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { internProfile: true }
    });

    if (!user || !user.internProfile) {
        return NextResponse.json({ message: "Akun belum diatur admin." }, { status: 403 });
    }

    const today = getTodayDateWIB();
    const startDate = new Date(user.internProfile.startDate);
    const endDate = new Date(user.internProfile.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
         return NextResponse.json({ message: "Periode magang invalid." }, { status: 403 });
    }

    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    if (today < startDate) return NextResponse.json({ message: "Periode belum dimulai." }, { status: 403 });
    if (today > endDate) return NextResponse.json({ message: "Periode sudah selesai." }, { status: 403 });

    // 2. CEK HARI LIBUR (SABTU & MINGGU) - HARDCODED BLOCK
    const dayIndex = getDayIndexWIB(); 
    if (dayIndex === 0 || dayIndex === 6) {
        return NextResponse.json({ message: "Hari libur! Absensi dinonaktifkan." }, { status: 403 });
    }

    // --- LOGIC ABSENSI ---
    const { type, latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
        return NextResponse.json({ message: "Lokasi tidak terdeteksi." }, { status: 400 });
    }

    const timeNow = getCurrentTimeWIB();
    const settings = getGlobalSettings();
    
    const batasMasuk = settings.startHour; 
    
    // TENTUKAN JAM PULANG BERDASARKAN HARI
    let batasPulang = settings.endHour; // Default (Senin-Kamis)
    
    if (dayIndex === 5) { // Jumat
        batasPulang = settings.endHourFriday; // Pake settingan khusus Jumat
    }

    console.log(`[ABSENSI] User: ${session.user.name}, Day: ${dayIndex}, Batas Pulang: ${batasPulang}, Current: ${timeNow}`);

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (7 * 3600000));
    wibTime.setHours(0, 0, 0, 0);
    const startOfDayUTC = new Date(wibTime.getTime() - (7 * 3600000));
    const endOfDayUTC = new Date(startOfDayUTC.getTime() + (24 * 60 * 60 * 1000));

    const existingLog = await prisma.attendance.findFirst({
        where: {
            userId: session.user.id,
            date: { gte: startOfDayUTC, lt: endOfDayUTC }
        }
    });

    if (type === "IN") {
        if (existingLog) return NextResponse.json({ message: "Anda sudah absen masuk." }, { status: 400 });

        const status = timeToMinutes(timeNow) > timeToMinutes(batasMasuk) ? "TELAT" : "HADIR";

        await prisma.attendance.create({
            data: {
                userId: session.user.id,
                date: new Date(), 
                time: timeNow,    
                status: status,
            }
        });

        return NextResponse.json({ message: "Berhasil Absen Masuk!", time: timeNow, status });
    } 
    else if (type === "OUT") {
        if (!existingLog) return NextResponse.json({ message: "Anda belum absen masuk!" }, { status: 400 });
        if (existingLog.timeOut) return NextResponse.json({ message: "Anda sudah absen pulang." }, { status: 400 });

        const currentMins = timeToMinutes(timeNow);
        const limitMins = timeToMinutes(batasPulang);

        // VALIDASI JAM PULANG (DYNAMIC)
        if (currentMins < limitMins) {
            return NextResponse.json({ 
                message: `Belum jam pulang! Tunggu sampai jam ${batasPulang} WIB.` 
            }, { status: 400 });
        }

        await prisma.attendance.update({
            where: { id: existingLog.id },
            data: { timeOut: timeNow }
        });

        return NextResponse.json({ message: "Berhasil Absen Pulang!", time: timeNow });
    }

    return NextResponse.json({ message: "Invalid type" }, { status: 400 });

  } catch (error) {
    console.error("Error presensi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}