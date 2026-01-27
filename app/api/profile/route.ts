import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unlink } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Helper buat hapus file
async function deleteOldFile(filePath: string) {
  try {
    // Cek apakah file itu file lokal (ada di folder uploads)
    if (filePath && filePath.startsWith("/uploads/")) {
      const absolutePath = path.join(process.cwd(), "public", filePath);
      await unlink(absolutePath);
      console.log(`Deleted old file: ${absolutePath}`);
    }
  } catch (error) {
    console.error("Gagal hapus file lama (mungkin file udah ga ada):", error);
    // Kita ignore errornya biar flow update ga putus cuma gara2 gagal hapus file
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      image: true, // Ambil image juga
      nip: true,
      jabatan: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, nip, jabatan, image } = body;

    // 1. Ambil data user lama dulu buat dapetin path foto lama
    const oldUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { image: true }
    });

    // 2. LOGIC PENGHAPUSAN FILE LAMA
    // Skenario: 
    // a. User ganti foto (image baru != image lama)
    // b. User hapus foto (image baru kosong/null, image lama ada)
    if (oldUser?.image && oldUser.image !== image) {
      await deleteOldFile(oldUser.image);
    }

    // 3. Update database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        nip,
        jabatan,
        image, // Update kolom image
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal update profile" }, { status: 500 });
  }
}