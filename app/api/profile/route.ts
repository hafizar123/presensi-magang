import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

// Helper: Hapus file fisik
async function deleteFile(filePath: string) {
  try {
    // Pastikan cuma hapus file di dalam folder uploads biar aman
    if (filePath && filePath.startsWith("/uploads/")) {
      const absolutePath = path.join(process.cwd(), "public", filePath);
      if (fs.existsSync(absolutePath)) {
        await unlink(absolutePath);
        console.log(`🗑️ Berhasil hapus file lama: ${filePath}`);
      }
    }
  } catch (error) {
    console.error("Gagal hapus file:", error);
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
      image: true,
      nip: true,
      jabatan: true,
      internProfile: true, 
    },
  });

  // Ambil setting jam kerja (biar Dashboard gak error)
  const configPath = path.join(process.cwd(), "settings.json");
  let globalSettings = { startHour: "07:30", endHour: "16:00" };
  try {
    if (fs.existsSync(configPath)) {
      const settingsData = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(settingsData);
      globalSettings = {
        startHour: parsed.opStartMonThu || "07:30",
        endHour: parsed.opEndMonThu || "16:00"
      };
    }
  } catch (e) {
    console.error("Gagal baca settings", e);
  }

  return NextResponse.json({ ...user, globalSettings });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, nip, jabatan, image, password } = body;

    // 1. Ambil data user LAMA (sebelum diupdate)
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { image: true }
    });

    const dataToUpdate: any = {};

    // 2. LOGIC HAPUS FOTO LAMA (PENTING!)
    // Cek apakah ada request update image?
    if (image !== undefined) {
        // Kondisi A: User klik "Hapus Foto" (image dikirim kosong/null)
        if (image === "" || image === null) {
            if (currentUser?.image) {
                await deleteFile(currentUser.image); // Hapus file lama
            }
            dataToUpdate.image = null; // Set DB jadi null
        } 
        // Kondisi B: User GANTI foto baru
        else if (image !== currentUser?.image) {
            // Hapus foto lama dulu kalo ada
            if (currentUser?.image) {
                await deleteFile(currentUser.image);
            }
            dataToUpdate.image = image; // Update path baru
        }
    }

    if (name) dataToUpdate.name = name;
    if (nip !== undefined) dataToUpdate.nip = nip;
    // Jabatan kita bolehin update di sini (tapi di frontend udah kita lock)
    if (jabatan !== undefined) dataToUpdate.jabatan = jabatan;

    if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error update profile:", error);
    return NextResponse.json({ error: "Gagal update profile" }, { status: 500 });
  }
}