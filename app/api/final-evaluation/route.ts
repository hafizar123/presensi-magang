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
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // === INTERN: Kirim / Update laporan akhir ===
    if (session.user.role !== "ADMIN") {
      const { pekerjaan, deskripsi } = body;

      if (!pekerjaan?.trim() || !deskripsi?.trim()) {
        return NextResponse.json({ message: "Semua kolom laporan wajib diisi." }, { status: 400 });
      }

      const existing = await prisma.finalEvaluation.findUnique({
        where: { userId: session.user.id },
      });

      if (existing) {
        // Sudah pernah kirim — update, tapi hanya kalau belum dinilai
        if (existing.status === "GRADED") {
          return NextResponse.json({ message: "Laporan sudah dinilai, tidak dapat diubah." }, { status: 400 });
        }
        await prisma.finalEvaluation.update({
          where: { userId: session.user.id },
          data: { pekerjaan, deskripsi, status: "PENDING" },
        });
      } else {
        // Pertama kali kirim
        await prisma.finalEvaluation.create({
          data: {
            userId: session.user.id,
            pekerjaan,
            deskripsi,
            status: "PENDING",
          },
        });
      }

      return NextResponse.json({ success: true, message: "Laporan berhasil dikirim." });
    }

    // === ADMIN: Beri penilaian ===
    const { 
      id, n1, n2, n3, n4, n5, nomorSurat, 
      userData, userId, previewData 
    } = body; 

    if (!userId) {
        return NextResponse.json({ message: "User ID tidak ditemukan." }, { status: 400 });
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
              startDate: new Date("1970-01-01"),
              endDate: new Date("1970-01-01"),
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
        status: "GRADED"
      }
    });

    return NextResponse.json({ success: true, message: "Data berhasil disimpan." });
  } catch (error) {
    console.error("Error saving:", error);
    return NextResponse.json({ message: "Gagal menyimpan data." }, { status: 500 });
  }
}