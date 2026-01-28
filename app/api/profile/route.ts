import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs"; // Tambahin ini buat baca JSON
import bcrypt from "bcrypt";

// Helper hapus file (Tetap sama)
async function deleteOldFile(filePath: string) {
  try {
    if (filePath && filePath.startsWith("/uploads/")) {
      const absolutePath = path.join(process.cwd(), "public", filePath);
      await unlink(absolutePath);
    }
  } catch (error) {
    console.error("Gagal hapus file lama:", error);
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Ambil Data User dari Database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      nip: true,
      jabatan: true,
      role: true,
      internProfile: true, 
    },
  });

  // 2. Ambil Settingan Jam Universal dari settings.json
  const configPath = path.join(process.cwd(), "settings.json");
  let globalSettings = { startHour: "07:30", endHour: "16:00" }; // Default kalau file ga ada

  try {
    if (fs.existsSync(configPath)) {
      const settingsData = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(settingsData);
      // Ambil jamnya aja
      globalSettings = {
        startHour: parsed.startHour || "07:30",
        endHour: parsed.endHour || "16:00"
      };
    }
  } catch (e) {
    console.error("Gagal baca settings global di profile API", e);
  }

  // 3. Gabungin Data User + Global Settings
  return NextResponse.json({ 
    ...user, 
    globalSettings // Kirim ini ke frontend
  });
}

// ... (Bagian PUT tetap sama kaya sebelumnya, ga usah diubah)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, nip, jabatan, image, password } = body;

    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (nip !== undefined) dataToUpdate.nip = nip;
    if (jabatan !== undefined) dataToUpdate.jabatan = jabatan;

    if (image) {
        dataToUpdate.image = image;
        const oldUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { image: true }
        });
        if (oldUser?.image && oldUser.image !== image) {
            await deleteOldFile(oldUser.image);
        }
    }

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
    return NextResponse.json({ error: "Gagal update profile" }, { status: 500 });
  }
}