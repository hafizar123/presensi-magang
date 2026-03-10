import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });

    const evaluations = await prisma.finalEvaluation.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, nomorInduk: true, divisi: true, internProfile: true }
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
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });

    const body = await req.json();
    const { id, n1, n2, n3, n4, n5, nomorSurat, userData, userId, previewData } = body; 

    if (!userId) return NextResponse.json({ message: "User ID tidak ditemukan" }, { status: 400 });

    const rataRata = ((n1 || 0) + (n2 || 0) + (n3 || 0) + (n4 || 0) + (n5 || 0)) / 5;

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name, nomorInduk: userData.nomorInduk, divisi: userData.divisi,
        internProfile: {
          upsert: {
            create: { instansi: userData.instansi, jurusan: userData.jurusan, startDate: new Date(), endDate: new Date() },
            update: { instansi: userData.instansi, jurusan: userData.jurusan }
          }
        }
      }
    });

    await prisma.finalEvaluation.update({
      where: { id },
      data: {
        nilaiSikap: n5, nilaiDisiplin: n1, nilaiTanggungJawab: n2, nilaiKerjasama: n3, nilaiInisiatif: n4, 
        rataRata, nomorSurat: nomorSurat || undefined, status: "GRADED",
        
        // SIMPAN EDITAN KE KOLOM BARU, JANGAN GANGGU FIELD "pekerjaan"
        customKepalaDinas: previewData?.kepalaDinas,
        customLamaHari: previewData?.lamaHari,
        customTanggalPelaksanaan: previewData?.tanggalPelaksanaan,
        customPekerjaan: previewData?.customPekerjaan,
      }
    });

    return NextResponse.json({ success: true, message: "Data penilaian dan verifikasi profil berhasil disimpan." });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menyimpan data penilaian." }, { status: 500 });
  }
}