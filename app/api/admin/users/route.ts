import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 1. GET: Ambil semua user (buat refresh data)
export async function GET(request: Request) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { internProfile: true },
  });
  return NextResponse.json(users);
}

// 2. POST: Tambah User Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Cek email duplikat
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email udah dipake bro!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "INTERN", // Default jadi anak magang
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ message: "Gagal bikin user" }, { status: 500 });
  }
}

// 3. DELETE: Hapus User
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID nya mana?" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal hapus user" }, { status: 500 });
  }
}