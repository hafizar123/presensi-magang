import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD atau "ALL"

  try {
    let whereClause = {};
    
    // Kalo misal bukan "ALL", baru kita filter pake tanggal
    if (dateParam && dateParam !== "ALL") {
      const searchDate = new Date(dateParam);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      
      whereClause = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const logs = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: true, 
      },
      orderBy: [
        { date: "desc" }, // Urutin tanggal dari yang paling baru
        { time: "asc" }   // Terus urutin dari yang berangkat paling pagi
      ],
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}