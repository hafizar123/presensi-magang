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
    // Tambahin oldPassword buat dicek
    const { name, nip, jabatan, image, oldPassword, newPassword } = body;

    // 1. Ambil data user LENGKAP (buat cek password & image)
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { image: true, password: true }
    });

    const dataToUpdate: any = {};

    // 2. LOGIC UPDATE PASSWORD DENGAN VERIFIKASI
    if (newPassword && newPassword.trim() !== "") {
        // Cek apakah password lama dikirim?
        if (!oldPassword) {
            return NextResponse.json({ message: "Password lama harus diisi." }, { status: 400 });
        }

        // Bandingkan password lama dengan hash di DB
        const isMatch = await bcrypt.compare(oldPassword, currentUser?.password || "");
        if (!isMatch) {
            return NextResponse.json({ message: "Password lama yang Anda masukkan salah." }, { status: 400 });
        }

        // Kalau cocok, baru hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        dataToUpdate.password = hashedPassword;
    }

    // 3. LOGIC HAPUS FOTO LAMA (Logic awal lu tetep aman)
    if (image !== undefined) {
        if (image === "" || image === null) {
            if (currentUser?.image) {
                await deleteFile(currentUser.image);
            }
            dataToUpdate.image = null;
        } 
        else if (image !== currentUser?.image) {
            if (currentUser?.image) {
                await deleteFile(currentUser.image);
            }
            dataToUpdate.image = image;
        }
    }

    if (name) dataToUpdate.name = name;
    if (nip !== undefined) dataToUpdate.nip = nip;
    if (jabatan !== undefined) dataToUpdate.jabatan = jabatan;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json({ 
        success: true, 
        message: "Profil berhasil diperbarui.",
        user: { name: updatedUser.name, image: updatedUser.image }
    });

  } catch (error) {
    console.error("Error update profile:", error);
    return NextResponse.json({ message: "Gagal memperbarui profil sistem." }, { status: 500 });
  }
}