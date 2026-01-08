import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. POST: Buat Pengumuman Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ message: "Judul sama isinya diisi dong bro!" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    return NextResponse.json({ message: "Gagal bikin pengumuman" }, { status: 500 });
  }
}

// 2. DELETE: Hapus Pengumuman
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID mana?" }, { status: 400 });

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ message: "Dihapus!" });
}