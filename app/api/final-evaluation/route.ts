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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id, n1, n2, n3, n4, n5, nomorSurat, 
      userData, userId, previewData 
    } = body; 

    if (!userId) {
        return NextResponse.json({ message: "User ID tidak ditemukan" }, { status: 400 });
    }

    const rataRata = ((n1 || 0) + (n2 || 0) + (n3 || 0) + (n4 || 0) + (n5 || 0)) / 5;

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name,
        nomorInduk: userData.nomorInduk,
        divisi: userData.divisi,
        internProfile: {
          upsert: {
            create: {
              instansi: userData.instansi,
              jurusan: userData.jurusan,
              startDate: new Date(), 
              endDate: new Date(),   
            },
            update: {
              instansi: userData.instansi,
              jurusan: userData.jurusan
            }
          }
        }
      }
    });

    await prisma.finalEvaluation.update({
      where: { id },
      data: {
        nilaiSikap: n5, 
        nilaiDisiplin: n1,
        nilaiTanggungJawab: n2,
        nilaiKerjasama: n3, 
        nilaiInisiatif: n4, 
        rataRata,
        nomorSurat: nomorSurat || undefined,
        customKepalaDinas: previewData?.kepalaDinas,
        customLamaHari: previewData?.lamaHari,
        customTanggalPelaksanaan: previewData?.tanggalPelaksanaan,
        // ----------------------------------
        status: "GRADED"
      }
    });

    return NextResponse.json({ success: true, message: "Berhasil disimpan." });
  } catch (error) {
    console.error("Error saving:", error);
    return NextResponse.json({ message: "Gagal menyimpan." }, { status: 500 });
  }
}