import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // 1. Cek Security (Wajib Admin)
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Minggir lu!" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, startDate, endDate, startHour, endHour } = body;

    // 2. Validasi input
    if (!userId || !startDate || !endDate || !startHour || !endHour) {
      return NextResponse.json({ message: "Data gak lengkap bro" }, { status: 400 });
    }

    // 3. Simpan ke Database (Pake upsert: Kalo ada di-update, kalo ga ada dibuat baru)
    const profile = await prisma.internProfile.upsert({
      where: {
        userId: userId, // Cari berdasarkan ID User
      },
      update: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startHour,
        endHour,
      },
      create: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startHour,
        endHour,
      },
    });

    return NextResponse.json({ message: "Jadwal berhasil disave!", data: profile });

  } catch (error) {
    console.error("Error setting schedule:", error);
    return NextResponse.json({ message: "Server error bro" }, { status: 500 });
  }
}