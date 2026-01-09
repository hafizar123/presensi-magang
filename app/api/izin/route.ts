import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Login dulu!" }, { status: 401 });

  try {
    // 1. Terima Data sebagai FormData (Bukan JSON lagi)
    const formData = await request.formData();
    const date = formData.get("date") as string;
    const reason = formData.get("reason") as string;
    const file = formData.get("file") as File | null;

    if (!date || !reason) {
      return NextResponse.json({ message: "Tanggal dan Alasan wajib diisi!" }, { status: 400 });
    }

    let fileName = null;

    // 2. Proses Upload File (Kalo ada)
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Bikin nama file unik biar ga bentrok (pake timestamp)
      fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
      
      // Simpan ke folder public/uploads
      // Pastikan folder 'public/uploads' udah dibuat manual ya bro!
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      try {
        await writeFile(path.join(uploadDir, fileName), buffer);
      } catch (error) {
        console.error("Gagal save file:", error);
        // Kalo gagal save (misal folder ga ada), tetep lanjut tapi tanpa file
      }
    }

    // 3. Simpan ke Database
    await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        reason: reason,
        proofFile: fileName, // Simpan nama filenya doang
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Izin berhasil diajukan!" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}