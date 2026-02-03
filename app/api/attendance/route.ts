import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Helper: Ambil jam sekarang WIB (Format "HH:mm")
function getCurrentTimeWIB() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Format 24 jam (PENTING)
  };
  // Ini bakal return misal "14:30" atau "08:05"
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

// Helper: Cek Jumat WIB
function isFridayWIB() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    weekday: "long"
  };
  const day = new Intl.DateTimeFormat("en-US", options).format(date);
  return day === "Friday";
}

// Helper: Convert "HH:mm" ke Total Menit (SIMPEL TAPI AKURAT)
function timeToMinutes(time: string) {
  if (!time || typeof time !== "string") return 0;
  
  // Bersihin dari karakter aneh, cuma ambil angka dan titik dua
  const clean = time.trim().replace(/[^0-9:]/g, "");
  
  const [hStr, mStr] = clean.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  if (isNaN(h) || isNaN(m)) return 0; // Safety check

  return (h * 60) + m;
}

// Helper: Baca Settings
function getGlobalSettings() {
  let settings = { startHour: "07:30", endHour: "16:00" };
  try {
    const configPath = path.join(process.cwd(), "settings.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.startHour) settings.startHour = parsed.startHour;
      if (parsed.endHour) settings.endHour = parsed.endHour;
    }
  } catch (error) {
    console.error("Gagal baca settings:", error);
  }
  return settings;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 1. CEK PERIODE MAGANG (SAMA SEPERTI SEBELUMNYA)
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
    
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    if (today < startDate) return NextResponse.json({ message: "Periode belum dimulai." }, { status: 403 });
    if (today > endDate) return NextResponse.json({ message: "Periode sudah selesai." }, { status: 403 });

    // --- LOGIC ABSENSI ---
    const { type, latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
        return NextResponse.json({ message: "Lokasi tidak terdeteksi." }, { status: 400 });
    }

    const timeNow = getCurrentTimeWIB();
    const settings = getGlobalSettings();
    
    const batasMasuk = settings.startHour || "07:30"; 
    let batasPulang = settings.endHour || "16:00";
    
    if (isFridayWIB()) {
        batasPulang = "14:30"; // Override Jumat
    }

    // DEBUGGING DI TERMINAL (WAJIB CEK INI KALAU ERROR)
    console.log("================ ABSENSI LOG ================");
    console.log(`User: ${session.user.name} | Type: ${type}`);
    console.log(`Waktu Sekarang: ${timeNow} (${timeToMinutes(timeNow)} menit)`);
    console.log(`Batas Pulang: ${batasPulang} (${timeToMinutes(batasPulang)} menit)`);
    console.log("=============================================");

    // Range Hari Ini (WIB)
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

    // === IN ===
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
    
    // === OUT ===
    else if (type === "OUT") {
        if (!existingLog) return NextResponse.json({ message: "Anda belum absen masuk!" }, { status: 400 });
        if (existingLog.timeOut) return NextResponse.json({ message: "Anda sudah absen pulang." }, { status: 400 });

        const currentMins = timeToMinutes(timeNow);
        const limitMins = timeToMinutes(batasPulang);

        // VALIDASI JAM PULANG (Logic Strict)
        if (limitMins > 0 && currentMins < limitMins) {
            console.log(`[BLOCKED] Pulang ditolak. Kurang ${limitMins - currentMins} menit.`);
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