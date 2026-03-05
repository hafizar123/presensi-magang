import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      nomorInduk: true, // UPDATE: nip -> nomorInduk
      divisi: true,     // UPDATE: jabatan -> divisi
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
    
    // UPDATE: nip -> nomorInduk, jabatan -> divisi
    const { name, nomorInduk, divisi, image, oldPassword, newPassword } = body;

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    
    // Pastikan data ini terupdate
    if (nomorInduk !== undefined) dataToUpdate.nomorInduk = nomorInduk;
    if (divisi !== undefined) dataToUpdate.divisi = divisi;
    
    if (image !== undefined) dataToUpdate.image = image;

    if (newPassword && newPassword.trim() !== "") {
        if (!oldPassword) {
            return NextResponse.json({ message: "Kata sandi lama harus diisi." }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(oldPassword, currentUser?.password || "");
        if (!isMatch) {
            return NextResponse.json({ message: "Kata sandi lama salah." }, { status: 400 });
        }

        dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json({ 
        success: true, 
        message: "Profil Admin berhasil diperbarui.",
    });

  } catch (error) {
    console.error("Error update admin profile:", error);
    return NextResponse.json({ message: "Gagal memperbarui profil admin." }, { status: 500 });
  }
}