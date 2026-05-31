import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Ambil instansi dan jurusan dari request
    const { name, email, password, nip, instansi, jurusan } = body;

    if (!name || !email || !password || !nip || !instansi || !jurusan) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat User terlebih dahulu, InternProfile (termasuk periode magang) akan diisi admin nanti
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "INTERN", 
        nomorInduk: nip,
        // Simpan instansi dan jurusan di internProfile tanpa startDate/endDate
        // Admin yang akan mengisi periode magang via halaman manajemen peserta
        internProfile: {
            create: {
                instansi,
                jurusan,
                // startDate & endDate wajib di schema, gunakan nilai sentinel
                // yang menandakan "belum dikonfigurasi" — admin harus memperbarui ini
                startDate: new Date("1970-01-01"),
                endDate: new Date("1970-01-01"),
            }
        }
      },
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat.", user },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server.", error },
      { status: 500 }
    );
  }
}