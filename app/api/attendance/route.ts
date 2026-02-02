import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Helper: Ambil jam sekarang dalam format "HH:mm" (WIB / UTC+7)
function getCurrentTimeWIB() {
  const now = new Date();
  // Paksa ke UTC+7 (WIB)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (7 * 3600000));
  
  const hours = wibTime.getHours().toString().padStart(2, '0');
  const minutes = wibTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper: Baca Settingan Admin (settings.json)
function getGlobalSettings() {
  try {
    const configPath = path.join(process.cwd(), "settings.json");
    if (fs.existsSync(configPath)) {
      const settingsData = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(settingsData);
    }
  } catch (error) {
    console.error("Gagal baca settings.json:", error);
  }
  // Default kalo error (Fallback aman)
  return { startHour: "07:30", endHour: "16:00" };
}

// Helper: Hitung Status (Hadir/Telat)
function calculateStatus(currentTime: string, limitTime: string) {
  // Ubah ke integer menit biar gampang dibandingin
  const [currH, currM] = currentTime.split(":").map(Number);
  const [limitH, limitM] = limitTime.split(":").map(Number);

  const currentTotal = currH * 60 + currM;
  const limitTotal = limitH * 60 + limitM;

  // Jika waktu sekarang LEBIH BESAR dari batas, berarti TELAT
  if (currentTotal > limitTotal) {
    return "TELAT";
  }
  return "HADIR";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Cek apakah user sudah absen hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam jadi 00:00 buat filter tanggal
    // *Note: Tanggal di DB biasanya UTC, tapi logic "user udh absen blm" relatif aman pake default date server asal konsisten.
    // Kalau mau super aman, range today-nya juga harus WIB, tapi next-auth session biasanya aman.
    
    // Tapi untuk amannya, kita pake range start & end of day UTC yg mencakup WIB hari ini
    // Atau cara simple: Cari record user yg dibuat >= today 00:00 WIB
    // Kita pake native Date object aja dlu yg simple.
    
    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            userId: session.user.id,
            date: {
                gte: today, // Lebih besar dari hari ini jam 00:00
            }
        }
    });

    if (existingAttendance) {
        return NextResponse.json({ message: "Anda sudah melakukan presensi hari ini." }, { status: 400 });
    }

    // 2. Ambil Waktu Sekarang (WIB) & Settingan Batas
    const timeNow = getCurrentTimeWIB(); // Contoh: "11:48"
    const settings = getGlobalSettings();
    const batasTelat = settings.startHour || "07:30"; // Ambil dari admin setting (default 07:30)

    // 3. Tentukan Status
    const statusPresensi = calculateStatus(timeNow, batasTelat);

    // 4. Simpan ke Database
    await prisma.attendance.create({
      data: {
        userId: session.user.id,
        date: new Date(), // Tanggal lengkap
        time: timeNow,    // Jam string "HH:mm" (WIB) yang disimpen
        status: statusPresensi, // HADIR atau TELAT
      },
    });

    return NextResponse.json({ 
        message: "Presensi berhasil dicatat", 
        status: statusPresensi,
        time: timeNow
    });

  } catch (error) {
    console.error("Error presensi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}