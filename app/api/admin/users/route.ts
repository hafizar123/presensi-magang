import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Ambil semua data user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { internProfile: true }, 
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
    const { name, email, password, role, nomorInduk, divisi } = body;

    if (password && password.length < 6) {
      return NextResponse.json({ message: "Kata sandi minimal 6 karakter" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        nomorInduk, // UPDATE DARI NIP
        divisi,     // UPDATE DARI JABATAN
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ message: "Gagal menambah pengguna" }, { status: 500 });
  }
}

// DELETE: Hapus User
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID diperlukan" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus pengguna" }, { status: 500 });
  }
}

// PUT: Edit User
export async function PUT(req: Request) {
    try {
      const body = await req.json();
      const { id, name, email, role, nomorInduk, divisi, password, startDate, endDate } = body;
  
      const dataToUpdate: any = { };
      
      if (name) dataToUpdate.name = name;
      if (email) dataToUpdate.email = email;
      if (role) dataToUpdate.role = role;
      if (nomorInduk !== undefined) dataToUpdate.nomorInduk = nomorInduk; // UPDATE
      if (divisi !== undefined) dataToUpdate.divisi = divisi;             // UPDATE
      
      if (password && password.trim() !== "") {
        if (password.length < 6) {
          return NextResponse.json({ message: "Kata sandi minimal 6 karakter" }, { status: 400 });
        }
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      if (startDate && endDate) {
        dataToUpdate.internProfile = {
            upsert: {
                create: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                },
                update: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                }
            }
        };
      }
  
      const updatedUser = await prisma.user.update({
        where: { id }, 
        data: dataToUpdate,
        include: { internProfile: true } 
      });
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error("Update error:", error);
      return NextResponse.json({ message: "Gagal memperbarui pengguna" }, { status: 500 });
    }
}