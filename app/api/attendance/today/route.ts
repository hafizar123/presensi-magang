import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  
  // Set jam ke 00:00:00 buat cari data hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await prisma.attendance.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    }
  });

  // Return data absen (kalau null berarti belum absen)
  return NextResponse.json({
    in: log ? log.time : null,
    // Kalau sistem lo ada absen pulang, tambahin logikanya disini
    out: null 
  });
}