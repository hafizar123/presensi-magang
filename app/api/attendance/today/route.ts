import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(null);
  }

  // LOGIC CARI DATA HARI INI (WIB AWARE)
  const now = new Date();
  
  // 1. Geser waktu server (UTC) ke WIB (UTC+7)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utc + (7 * 3600000));

  // 2. Set jam jadi 00:00:00 (Awal Hari WIB)
  wibTime.setHours(0, 0, 0, 0);

  // 3. Balikin lagi ke UTC biar query DB-nya bener
  // (Karena di DB Prisma nyimpennya UTC, kita harus cocokin querynya)
  const startOfDayUTC = new Date(wibTime.getTime() - (7 * 3600000));
  
  // 4. Bikin End of Day juga biar akurat (Optional tapi recommended)
  const endOfDayUTC = new Date(startOfDayUTC.getTime() + (24 * 60 * 60 * 1000));

  try {
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDayUTC, // Lebih besar dari jam 00:00 WIB hari ini
          lt: endOfDayUTC     // Kurang dari jam 00:00 WIB besok
        },
      },
    });

    return NextResponse.json(attendance); // Balikin object attendance atau null
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}