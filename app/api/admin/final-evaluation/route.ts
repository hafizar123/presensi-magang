import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const evaluations = await prisma.finalEvaluation.findMany({
      include: {
        user: {
          select: { name: true, email: true, internProfile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const body = await req.json();
    
    // SESUAIKAN: n1(disiplin), n2(tanggungjawab), n3(kerjasama), n4(inisiatif), n5(sikap)
    const { id, n1, n2, n3, n4, n5, nomorSurat } = body; 

    // Hitung Rata-Rata (Pastikan nilainya tidak undefined)
    const rataRata = ((n1 || 0) + (n2 || 0) + (n3 || 0) + (n4 || 0) + (n5 || 0)) / 5;

    await prisma.finalEvaluation.update({
      where: { id },
      data: {
        nilaiSikap: n1,
        nilaiDisiplin: n2,
        nilaiTanggungJawab: n3,
        nilaiKerjasama: n4, 
        nilaiInisiatif: n5,
        rataRata,
        nomorSurat: nomorSurat !== undefined ? nomorSurat : undefined,
        status: "GRADED"
      }
    });

    return NextResponse.json({ message: "Data penilaian berhasil disimpan." });
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan server saat menyimpan penilaian." }, { status: 500 });
  }
}