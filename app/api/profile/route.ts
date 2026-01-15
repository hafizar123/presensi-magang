import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, image } = body; 

    // Validasi Password
    if (password && password !== confirmPassword) {
      return NextResponse.json({ error: "Password tidak cocok" }, { status: 400 });
    }

    const updateData: any = { 
        name,
        email
    };

    // Update foto jika ada
    if (image) {
        updateData.image = image;
    }

    // Encrypt password jika ada
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update ke Database
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Gagal update profile" }, { status: 500 });
  }
}