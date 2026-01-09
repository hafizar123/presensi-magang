import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. GET: Ambil List Request (Semua Status)
export async function GET() {
  try {
    const requests = await prisma.leaveRequest.findMany({
      // Kita ambil semua (Approved/Rejected/Pending) buat History
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error GET Izin:", error);
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}

// 2. PUT: Proses Approve/Reject
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body; // status = APPROVED / REJECTED

    // 1. Update Status di tabel LeaveRequest dulu
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    // Reset jam tanggal izin ke 00:00:00 biar sinkron sama logika Absen
    const attendanceDate = new Date(updatedRequest.date);
    attendanceDate.setHours(0, 0, 0, 0);

    // --- LOGIC MAGIC (REVISI) ---
    
    // Kalo DISETUJUI -> Masukin ke Tabel Absensi
    if (status === "APPROVED") {
        await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId: updatedRequest.userId,
                    date: attendanceDate,
                }
            },
            update: {
                status: "IZIN", // Timpa kalo tadinya Alpha/Hadir
                time: "-",      
            },
            create: {
                userId: updatedRequest.userId,
                date: attendanceDate,
                time: "-",      
                status: "IZIN",
            }
        });
    } 
    
    // Kalo DITOLAK -> Hapus data di Tabel Absensi (Undo Izin)
    // Biar kalo admin salah klik approve terus di-reject, datanya bersih lagi.
    else if (status === "REJECTED") {
        await prisma.attendance.deleteMany({
            where: {
                userId: updatedRequest.userId,
                date: attendanceDate,
                status: "IZIN" // Cuma hapus kalo statusnya IZIN (Jaga-jaga)
            }
        });
    }

    return NextResponse.json({ message: `Sukses update jadi ${status}!` });

  } catch (error) {
    console.error("Error PUT Izin:", error);
    return NextResponse.json({ message: "Server error bro" }, { status: 500 });
  }
}