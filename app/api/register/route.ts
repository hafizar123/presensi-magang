import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. TAMBAHIN nip DI SINI BRAY 👇
    const { name, email, password, nip } = body;

    // 1. Cek kelengkapan data
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Isi semua kolom woy!" },
        { status: 400 }
      );
    }

    // 2. Cek apakah email udah dipake?
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email udah kepake bro, cari yang lain" },
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
        nip, // 2. MASUKIN nip KE DALAM PRISMA CREATE SINI 👇
      },
    });

    return NextResponse.json(
      { message: "User berhasil dibuat!", user },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Ada error di server bro", error },
      { status: 500 }
    );
  }
}