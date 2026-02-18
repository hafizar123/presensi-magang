import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET: Ambil semua user yang udah submit laporan akhir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// POST: Admin ngasih nilai
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, n1, n2, n3, n4, n5 } = body; // n1-n5 itu aspek penilaian

    const rataRata = (n1 + n2 + n3 + n4 + n5) / 5;

    await prisma.finalEvaluation.update({
      where: { id },
      data: {
        nilaiDisiplin: n1,
        nilaiTanggungJawab: n2,
        nilaiInisiatif: n3,
        nilaiKerjasama: n4,
        nilaiKualitas: n5,
        rataRata,
        status: "GRADED"
      }
    });

    return NextResponse.json({ message: "Nilai berhasil disimpan" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}