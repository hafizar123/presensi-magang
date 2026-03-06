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
          select: { 
            id: true,
            name: true, 
            email: true, 
            nomorInduk: true, 
            divisi: true,
            internProfile: true 
          }
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
    const { 
      id, n1, n2, n3, n4, n5, nomorSurat, 
      userData, userId 
    } = body; 

    if (!userId) {
        return NextResponse.json({ message: "User ID tidak ditemukan" }, { status: 400 });
    }

    // 1. Hitung Rata-Rata
    const rataRata = ((n1 || 0) + (n2 || 0) + (n3 || 0) + (n4 || 0) + (n5 || 0)) / 5;

    // 2. LOGIC FIX: Update User & Upsert InternProfile
    // Pake upsert supaya kalau record profilnya belum ada, dia otomatis create
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
              startDate: new Date(), // Wajib ada di schema lu
              endDate: new Date(),   // Wajib ada di schema lu
            },
            update: {
              instansi: userData.instansi,
              jurusan: userData.jurusan
            }
          }
        }
      }
    });

    // 3. Update Penilaian di tabel FinalEvaluation
    // Sesuaikan n1-n5 dengan field schema lu (nilaiSikap, nilaiDisiplin, dll)
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
        status: "GRADED"
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Data penilaian dan verifikasi profil berhasil disimpan." 
    });

  } catch (error) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json({ message: "Gagal menyimpan data penilaian." }, { status: 500 });
  }
}