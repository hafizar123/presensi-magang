import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET: Ambil semua data user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nip: true,
        jabatan: true,
        image: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Tambah User Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, nip, jabatan } = body;

    // Cek email duplikat
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        nip,
        jabatan,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ message: "Gagal menambah user" }, { status: 500 });
  }
}

// DELETE: Hapus User
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus user" }, { status: 500 });
  }
}

// PUT: Edit User (Simple version)
export async function PUT(req: Request) {
    try {
      const body = await req.json();
      const { id, name, email, role, nip, jabatan, password } = body;
  
      const dataToUpdate: any = { name, email, role, nip, jabatan };
      
      // Kalo password diisi, update password juga
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }
  
      await prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });
  
      return NextResponse.json({ message: "User diupdate" });
    } catch (error) {
      return NextResponse.json({ message: "Gagal update user" }, { status: 500 });
    }
}