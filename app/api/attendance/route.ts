import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Helper: Ambil jam sekarang (WIB)
function getCurrentTimeWIB() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (7 * 3600000));
  
  const hours = wibTime.getHours().toString().padStart(2, '0');
  const minutes = wibTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper: Cek apakah hari ini Jumat?
function isFridayWIB() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (7 * 3600000));
  return wibTime.getDay() === 5; // 0 = Minggu, 5 = Jumat
}

// Helper: Convert "HH:mm" ke menit (Integer) buat perbandingan
function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Helper: Baca Settings
function getGlobalSettings() {
  try {
    const configPath = path.join(process.cwd(), "settings.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (error) {
    console.error("Gagal baca settings:", error);
  }
  return { startHour: "07:30", endHour: "16:00" };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { type, latitude, longitude } = await req.json(); // type: "IN" atau "OUT"
    
    // Validasi Lokasi (Contoh sederhana, bisa diperketat)
    if (!latitude || !longitude) {
        return NextResponse.json({ message: "Lokasi tidak terdeteksi." }, { status: 400 });
    }

    const timeNow = getCurrentTimeWIB();
    const settings = getGlobalSettings();
    
    // --- LOGIC JAM KANTOR (JUMAT vs BIASA) ---
    // Batas Telat (Masuk)
    const batasTelat = settings.startHour || "07:30"; 
    
    // Batas Pulang (Operasional Selesai)
    let jamPulangKantor = settings.endHour || "16:00";
    if (isFridayWIB()) {
        jamPulangKantor = "14:30"; // Otomatis ganti kalo Jumat
    }

    // RANGE HARI INI (WIB)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (7 * 3600000));
    wibTime.setHours(0, 0, 0, 0); // Start of day WIB
    const startOfDayUTC = new Date(wibTime.getTime() - (7 * 3600000));
    const endOfDayUTC = new Date(startOfDayUTC.getTime() + (24 * 60 * 60 * 1000));

    // Cari Log Hari Ini
    const existingLog = await prisma.attendance.findFirst({
        where: {
            userId: session.user.id,
            date: { gte: startOfDayUTC, lt: endOfDayUTC }
        }
    });

    // ===========================
    // LOGIC ABSEN MASUK (IN)
    // ===========================
    if (type === "IN") {
        if (existingLog) {
            return NextResponse.json({ message: "Anda sudah absen masuk hari ini." }, { status: 400 });
        }

        // Cek Telat
        const status = timeToMinutes(timeNow) > timeToMinutes(batasTelat) ? "TELAT" : "HADIR";

        await prisma.attendance.create({
            data: {
                userId: session.user.id,
                date: new Date(), // Simpan UTC actual timestamp
                time: timeNow,    // String WIB
                status: status,
            }
        });

        return NextResponse.json({ message: "Berhasil Absen Masuk!", time: timeNow, status });
    } 
    
    // ===========================
    // LOGIC ABSEN PULANG (OUT)
    // ===========================
    else if (type === "OUT") {
        if (!existingLog) {
            return NextResponse.json({ message: "Anda belum absen masuk!" }, { status: 400 });
        }
        if (existingLog.timeOut) {
            return NextResponse.json({ message: "Anda sudah absen pulang hari ini." }, { status: 400 });
        }

        // Cek Jam Pulang (Gaboleh pulang sebelum waktunya)
        if (timeToMinutes(timeNow) < timeToMinutes(jamPulangKantor)) {
            return NextResponse.json({ 
                message: `Belum jam pulang! Tunggu sampai ${jamPulangKantor} WIB.` 
            }, { status: 400 });
        }

        await prisma.attendance.update({
            where: { id: existingLog.id },
            data: {
                timeOut: timeNow
            }
        });

        return NextResponse.json({ message: "Berhasil Absen Pulang! Hati-hati di jalan.", time: timeNow });
    }

    return NextResponse.json({ message: "Invalid type" }, { status: 400 });

  } catch (error) {
    console.error("Error presensi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}