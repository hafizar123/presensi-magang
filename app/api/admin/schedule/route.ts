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
    const { userId, startDate, endDate } = body; // startHour & endHour dibuang karena sudah global

    // 2. Validasi input (Hanya cek ID user dan tanggal)
    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ message: "Data tanggal gak lengkap bro" }, { status: 400 });
    }

    // 3. Simpan ke Database
    const profile = await prisma.internProfile.upsert({
      where: {
        userId: userId,
      },
      update: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      create: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ message: "Periode magang berhasil disave!", data: profile });

  } catch (error) {
    console.error("Error setting schedule:", error);
    return NextResponse.json({ message: "Server error bro" }, { status: 500 });
  }
}