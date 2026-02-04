import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// --- 1. DEFINISI TIPE SETTINGS (BIAR GA ERROR) ---
interface AppSettings {
  startHour: string;
  endHour: string;
  latitude: number | null;
  longitude: number | null;
  radius: number;
}

// --- HELPER TIME (WIB) ---
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

function isFridayWIB() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    weekday: "long"
  };
  const day = new Intl.DateTimeFormat("en-US", options).format(date);
  return day === "Friday";
}

function timeToMinutes(time: string) {
  if (!time || typeof time !== "string") return 0;
  const clean = time.trim().replace(/[^0-9:]/g, "");
  const [hStr, mStr] = clean.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return (h * 60) + m;
}

// --- HELPER SETTINGS (SUDAH DIPERBAIKI) ---
function getGlobalSettings(): AppSettings {
  // Default values yang lengkap sesuai Interface
  let settings: AppSettings = { 
      startHour: "07:30", 
      endHour: "16:00",
      latitude: null,  
      longitude: null, 
      radius: 50       
  };

  try {
    const configPath = path.join(process.cwd(), "settings.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      
      // Override defaults if exist
      if (parsed.startHour) settings.startHour = parsed.startHour;
      if (parsed.endHour) settings.endHour = parsed.endHour;
      
      // Parse Koordinat (Pastikan jadi number)
      if (parsed.latitude) settings.latitude = parseFloat(parsed.latitude);
      if (parsed.longitude) settings.longitude = parseFloat(parsed.longitude);
      
      // Parse Radius (Integer)
      if (parsed.radius) settings.radius = parseInt(parsed.radius);
    }
  } catch (error) {
    console.error("Gagal baca settings:", error);
  }
  return settings;
}

// --- HELPER GEOFENCING (HAVERSINE) ---
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi (meter)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak (meter)
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// ==========================================
// MAIN HANDLER
// ==========================================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 1. CEK PERIODE MAGANG
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

    // --- TERIMA DATA DARI USER ---
    const { type, latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
        return NextResponse.json({ message: "Lokasi tidak terdeteksi. Aktifkan GPS!" }, { status: 400 });
    }

    // --- AMBIL SETTINGAN ADMIN ---
    const settings = getGlobalSettings();
    const timeNow = getCurrentTimeWIB();
    
    // 2. LOGIC GEOFENCING (DINAMIS DARI SETTINGS)
    // Cuma jalanin kalau Admin udah set Lat & Long (tidak null)
    if (settings.latitude !== null && settings.longitude !== null) {
        const distance = getDistanceFromLatLonInMeters(
            latitude, 
            longitude, 
            settings.latitude, 
            settings.longitude
        );

        console.log(`[GEOFENCING] User: ${session.user.name} | Jarak: ${distance.toFixed(1)}m | Max: ${settings.radius}m`);

        if (distance > settings.radius) {
            return NextResponse.json({ 
                message: `Jarak terlalu jauh (${distance.toFixed(0)}m). Masuk area kantor (${settings.radius}m) untuk absen.`,
                distance: distance 
            }, { status: 400 });
        }
    } else {
        console.log("[GEOFENCING] Skipped: Koordinat kantor belum diset di admin.");
    }

    // --- LOGIC JAM ---
    const batasMasuk = settings.startHour; 
    let batasPulang = settings.endHour;
    
    if (isFridayWIB()) {
        batasPulang = "14:30"; 
    }

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

        if (limitMins > 0 && currentMins < limitMins) {
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