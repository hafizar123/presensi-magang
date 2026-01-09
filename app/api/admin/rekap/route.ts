import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD

  if (!dateParam) {
    return NextResponse.json([]);
  }

  // Kita cari log berdasarkan tanggal
  const searchDate = new Date(dateParam);
  
  // Karena di DB nyimpen DateTime, kita harus filter range dari 00:00 sampe 23:59 hari itu
  const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

  try {
    const logs = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: true, // Join tabel user buat dapet nama
      },
      orderBy: {
        time: "asc", // Urutin dari yang dateng pagi
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}