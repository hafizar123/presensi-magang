import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, nip } = body;

    if (!name || !email || !password || !nip) {
      return NextResponse.json(
        { message: "Data belum lengkap!" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter!" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "INTERN", 
        nip,
      },
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat!", user },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error!", error },
      { status: 500 }
    );
  }
}