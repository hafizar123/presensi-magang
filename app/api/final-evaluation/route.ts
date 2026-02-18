import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { pekerjaan, deskripsi } = body;

    if (!pekerjaan || !deskripsi) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    // Simpan atau Update laporan akhir
    const evaluation = await prisma.finalEvaluation.upsert({
      where: { userId: session.user.id },
      update: { pekerjaan, deskripsi, status: "PENDING" },
      create: {
        userId: session.user.id,
        pekerjaan,
        deskripsi,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Laporan akhir berhasil dikirim", data: evaluation });
  } catch (error) {
    console.error("Error Final Evaluation:", error);
    return NextResponse.json({ message: "Gagal memproses laporan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await prisma.finalEvaluation.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}