import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// 1. GET: Ambil Semua User
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // Password JANGAN dikirim ke frontend demi keamanan
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. POST: Tambah User Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Cek email duplikat
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: "Gagal tambah user" }, { status: 500 });
  }
}

// 3. PUT: Edit User (INI YANG LO BUTUHIN BRO) ✅
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, password, role } = body;

    // Siapin data yang mau diupdate
    const updateData: any = {
      name,
      email,
      role,
    };

    // Logic Cerdik:
    // Kalo password diisi, kita hash terus update.
    // Kalo password kosong, JANGAN diapa-apain (biar password lama gak ilang/berubah jadi kosong).
    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error update:", error);
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

// 4. DELETE: Hapus User
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID user diperlukan" }, { status: 400 });
    }

    // Hapus data terkait dulu (biar database ga ngamuk constraint error)
    // 1. Hapus Absensi
    await prisma.attendance.deleteMany({ where: { userId: id } });
    // 2. Hapus Request Izin
    await prisma.leaveRequest.deleteMany({ where: { userId: id } });
    // 3. Hapus Profile Magang
    await prisma.internProfile.deleteMany({ where: { userId: id } });
    
    // 4. Baru Hapus Usernya
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus user" }, { status: 500 });
  }
}