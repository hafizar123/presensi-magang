import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Tarik instansi sama jurusan dari request bray
    const { name, email, password, nip, instansi, jurusan } = body;

    if (!name || !email || !password || !nip || !instansi || !jurusan) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter." },
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

    // Bikin User dulu, InternProfile (termasuk periode magang) akan diisi admin nanti
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "INTERN", 
        nomorInduk: nip,
        // Simpan instansi & jurusan di internProfile tapi TANPA startDate/endDate
        // Admin yang akan mengisi periode magang via halaman manajemen peserta
        internProfile: {
            create: {
                instansi,
                jurusan,
                // startDate & endDate wajib di schema, kasih nilai sentinel yang jelas
                // menandakan "belum diatur" — admin harus update ini
                startDate: new Date("1970-01-01"),
                endDate: new Date("1970-01-01"),
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