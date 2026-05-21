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
      nomorInduk: true,
      divisi: true, 
      internProfile: true, 
    },
  });

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
    
    // Nangkep instansi sama jurusan dari Frontend
    const { name, nomorInduk, divisi, image, oldPassword, newPassword, instansi, jurusan } = body;

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        // Jangan lupa select internProfile biar kaga nabrak pas upsert
        select: { image: true, password: true, internProfile: true }
    });

    const dataToUpdate: any = {};

    if (newPassword && newPassword.trim() !== "") {
        if (!oldPassword) {
            return NextResponse.json({ message: "Password lama harus diisi." }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(oldPassword, currentUser?.password || "");
        if (!isMatch) {
            return NextResponse.json({ message: "Password lama yang Anda masukkan salah." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        dataToUpdate.password = hashedPassword;
    }

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
    if (nomorInduk !== undefined) dataToUpdate.nomorInduk = nomorInduk;
    if (divisi !== undefined) dataToUpdate.divisi = divisi;

    // 👇 LOGIC UPDATE SEKOLAH / JURUSAN ZHANGG! 👇
    if (instansi !== undefined || jurusan !== undefined) {
        dataToUpdate.internProfile = {
            upsert: {
                create: {
                    instansi: instansi || "",
                    jurusan: jurusan || "",
                    startDate: currentUser?.internProfile?.startDate || new Date(),
                    endDate: currentUser?.internProfile?.endDate || new Date(),
                },
                update: {
                    ...(instansi !== undefined && { instansi }),
                    ...(jurusan !== undefined && { jurusan })
                }
            }
        };
    }

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