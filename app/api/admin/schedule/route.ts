import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // Pastiin ini import dari lib lo

export async function POST(request: Request) {
  // 1. Cek Security (Wajib Admin)
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Akses ditolak. Anda bukan admin." }, 
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { userId, startDate, endDate } = body; 

    // 2. Validasi input
    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Data tidak lengkap. Cek userId dan tanggal." }, 
        { status: 400 }
      );
    }

    // 3. Simpan ke Database (Upsert)
    const profile = await prisma.internProfile.upsert({
      where: {
        userId: userId, // Cek berdasarkan userId
      },
      update: {
        // Kalo data udah ada, update tanggalnya aja
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      create: {
        // Kalo data belum ada, bikin baru + connect ke user
        user: {
            connect: {
                id: userId
            }
        },
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ 
      message: "Periode magang berhasil disimpan!", 
      data: profile 
    });

  } catch (error) {
    console.error("Error setting schedule:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." }, 
      { status: 500 }
    );
  }
}