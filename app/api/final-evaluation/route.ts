import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const evaluation = await prisma.finalEvaluation.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(evaluation);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pekerjaan, deskripsi } = await req.json();

    // PERBAIKAN: Gunakan userId yang benar di bagian create dan update
    const result = await prisma.finalEvaluation.upsert({
      where: { userId: session.user.id },
      update: {
        pekerjaan,
        deskripsi,
        status: "PENDING", // Reset status jadi pending kalau user update laporan
      },
      create: {
        userId: session.user.id, // WAJIB ADA MEK!
        pekerjaan,
        deskripsi,
        status: "PENDING",
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json({ message: "Gagal menyimpan laporan." }, { status: 500 });
  }
}