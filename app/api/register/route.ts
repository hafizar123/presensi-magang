import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Tarik instansi sama jurusan dari request bray
    const { name, email, password, nip, instansi, jurusan } = body;

    if (!name || !email || !password || !nip || !instansi || !jurusan) {
      return NextResponse.json(
        { message: "Data belum lengkap ngab!" },
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

    // Bikin User sekalian nge-create InternProfile-nya biar otomatis ke-link
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "INTERN", 
        nomorInduk: nip, // Di schema lu namanya nomorInduk ngab
        internProfile: {
            create: {
                instansi,
                jurusan,
                // Kasih dummy date dulu karena di register page belum ada input tanggal
                startDate: new Date(),
                endDate: new Date(),
            }
        }
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