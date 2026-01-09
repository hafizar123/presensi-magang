import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // 1. Cek User Login
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Login dulu bos!" }, { status: 401 });

  const userId = session.user.id;
  
  try {
    // 2. Ambil Jadwal User (InternProfile)
    const profile = await prisma.internProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ message: "Jadwal belum diatur Admin!" }, { status: 400 });
    }

    // 3. Logic Waktu (Jam Server)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Konversi jam sekarang jadi format "HH:mm" (misal "08:30") buat dibandingin
    const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Ambil jam dari jadwal (Format DB: "07:00" & "08:00")
    const scheduleStart = profile.startHour; 
    const scheduleEnd = profile.endHour; 

    // Cek Kepagian
    if (currentTimeString < scheduleStart) {
        return NextResponse.json({ message: `Belum waktunya absen! Absen dibuka jam ${scheduleStart}` }, { status: 400 });
    }

    // Tentukan Status (HADIR / TELAT)
    // Logikanya: Kalo absen LEBIH DARI scheduleEnd (Tutup Absen), berarti TELAT.
    // Atau lo bisa set logic sendiri, misal start 07:00, end 08:00. Lewat 08:00 = Telat.
    let status = "HADIR";
    if (currentTimeString > scheduleEnd) {
        status = "TELAT";
    }

    // 4. Cek Double Absen (Anti Spam)
    // Kita set jam ke 00:00:00 buat kunci unik tanggal
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId,
                date: today
            }
        }
    });

    if (existingLog) {
        return NextResponse.json({ message: "Woy, udah absen hari ini!" }, { status: 400 });
    }

    // 5. SIMPAN KE DATABASE
    await prisma.attendance.create({
        data: {
            userId,
            date: today, // Kunci tanggal
            time: currentTimeString, // Jam display (ex: "08:15")
            status: status, 
        }
    });

    return NextResponse.json({ message: "Berhasil Absen!", status });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error bro" }, { status: 500 });
  }
}