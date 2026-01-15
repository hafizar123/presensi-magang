import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. GET: Ambil Semua Pengumuman (Urut dari yg terbaru)
export async function GET() {
  try {
    const data = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. POST: Buat Pengumuman Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content,
        isActive: true, // Default langsung tayang
      },
    });
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: "Gagal create" }, { status: 500 });
  }
}

// 3. PUT: Edit Pengumuman (Isi Konten / Ganti Status Aktif)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, isActive } = body;

    const updatedItem = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        isActive, // Ini bisa nerima true/false
      },
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

// 4. DELETE: Hapus Pengumuman
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID kosong" }, { status: 400 });

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}