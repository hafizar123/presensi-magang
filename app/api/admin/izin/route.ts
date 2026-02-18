import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Gunakan lib prisma agar koneksi efisien

// 1. GET: Ambil List Request (Serta data User & Divisinya)
export async function GET() {
  try {
    const requests = await prisma.leaveRequest.findMany({
      include: { 
        user: {
          select: {
            name: true,
            email: true,
            jabatan: true, // AMBIL DATA DIVISI DI SINI
          }
        } 
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error GET Izin:", error);
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. PUT: Proses Approve/Reject (Tetap sama seperti logika sebelumnya)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body; 

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    const attendanceDate = new Date(updatedRequest.date);
    attendanceDate.setHours(0, 0, 0, 0);

    if (status === "APPROVED") {
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: updatedRequest.userId,
                date: attendanceDate,
            }
        });

        if (existingAttendance) {
            await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status: "IZIN",
                    time: "-",
                }
            });
        } else {
            await prisma.attendance.create({
                data: {
                    userId: updatedRequest.userId,
                    date: attendanceDate,
                    time: "-",
                    status: "IZIN",
                }
            });
        }
    } 
    else if (status === "REJECTED") {
        await prisma.attendance.deleteMany({
            where: {
                userId: updatedRequest.userId,
                date: attendanceDate,
                status: "IZIN" 
            }
        });
    }

    return NextResponse.json({ message: `Sukses update jadi ${status}!` });

  } catch (error) {
    console.error("Error PUT Izin:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}