import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ambil data dari body request
    const { date, reason, proofFile } = await req.json();

    if (!date || !reason) {
        return NextResponse.json({ message: "Tanggal dan Alasan wajib diisi." }, { status: 400 });
    }

    // Validasi Tanggal (Biar aman masuk database)
    const izinDate = new Date(date);
    if (isNaN(izinDate.getTime())) {
        return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    // Simpan ke Database
    await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        date: izinDate,
        reason: reason,
        proofFile: proofFile || null, // Simpan nama file (atau null kalo ga ada)
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Pengajuan izin berhasil dikirim." });

  } catch (error) {
    console.error("Error submit izin:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}