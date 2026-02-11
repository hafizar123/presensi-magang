import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET: Ambil semua data user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      // PENTING: Include internProfile biar data tanggal magang kebawa
      include: { internProfile: true }, 
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Tambah User Baru (Tetap sama kayak default)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, nip, jabatan } = body;

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
        nip,
        jabatan,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ message: "Gagal menambah user" }, { status: 500 });
  }
}

// DELETE: Hapus User (Tetap sama)
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

// PUT: Edit User (INI YANG KITA MODIFIKASI)
export async function PUT(req: Request) {
    try {
      const body = await req.json();
      // Kita terima startDate & endDate juga di sini selain data user biasa
      const { id, name, email, role, nip, jabatan, password, startDate, endDate } = body;
  
      const dataToUpdate: any = { };
      
      // Update field standard user kalo ada
      if (name) dataToUpdate.name = name;
      if (email) dataToUpdate.email = email;
      if (role) dataToUpdate.role = role;
      if (nip !== undefined) dataToUpdate.nip = nip;
      if (jabatan !== undefined) dataToUpdate.jabatan = jabatan;
      
      if (password && password.trim() !== "") {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      // --- LOGIC MAGIC BUAT INTERN PROFILE ---
      // Kalo ada kiriman tanggal, kita update tabel sebelah (InternProfile)
      // Pake 'upsert' biar pinter: kalo belum ada dibuat baru, kalo udah ada diupdate.
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
      // -------------------------------------------
  
      const updatedUser = await prisma.user.update({
        where: { id }, // ID-nya pake ID User
        data: dataToUpdate,
        include: { internProfile: true } // Return data lengkap buat konfirmasi
      });
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error("Update error:", error);
      return NextResponse.json({ message: "Gagal update user" }, { status: 500 });
    }
}