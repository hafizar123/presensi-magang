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
    const body = await req.json();
    const { date, reason, proofFile } = body;

    console.log("📥 API IZIN RECEIVED DATA:", { date, reason, proofFile }); // DEBUG

    if (!date || !reason) {
        return NextResponse.json({ message: "Tanggal dan Alasan wajib diisi." }, { status: 400 });
    }

    // Validasi Tanggal
    const izinDate = new Date(date);
    if (isNaN(izinDate.getTime())) {
        return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    // Simpan ke Database
    // Pastikan proofFile yang disimpan valid (bukan string kosong atau undefined)
    const finalProofFile = proofFile && proofFile.trim() !== "" ? proofFile : null;

    await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        date: izinDate,
        reason: reason,
        proofFile: finalProofFile,
        status: "PENDING",
      },
    });

    console.log("Izin berhasil diajukan");

    return NextResponse.json({ message: "Pengajuan izin berhasil dikirim." });

  } catch (error) {
    console.error("Error submit izin:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}