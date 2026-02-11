import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Pake global prisma client biar gak too many connections
// Kalo lu udah punya @/lib/prisma, mending import dari situ.
// Tapi kalo mau hardcode gini juga gpp sementara.
const prisma = new PrismaClient();

// 1. GET: Ambil List Request (Semua Status)
export async function GET() {
  try {
    const requests = await prisma.leaveRequest.findMany({
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

    // A. Update Status di tabel LeaveRequest dulu
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    // Reset jam tanggal izin ke 00:00:00 biar sinkron sama logika Absen
    // Pastikan ini match sama cara lu nyimpen absen (biasanya setHours 0,0,0,0)
    const attendanceDate = new Date(updatedRequest.date);
    attendanceDate.setHours(0, 0, 0, 0);

    // --- LOGIC MAGIC (FIXED VERSION) ---
    
    // Kalo DISETUJUI -> Masukin ke Tabel Absensi
    if (status === "APPROVED") {
        
        // 1. Cek dulu, user ini di tanggal itu udah ada absen/izin belum?
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: updatedRequest.userId,
                date: attendanceDate,
            }
        });

        if (existingAttendance) {
            // 2A. Kalo udah ada (misal dia udah absen tapi sakit, atau double input), UPDATE aja
            await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status: "IZIN",
                    time: "-", // Time in dianggap strip
                    // timeOut biarin aja atau null-in
                }
            });
        } else {
            // 2B. Kalo belum ada sama sekali, CREATE baru
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
    
    // Kalo DITOLAK -> Hapus data di Tabel Absensi (Undo Izin)
    // Biar kalo admin salah klik approve terus di-reject, datanya bersih lagi.
    else if (status === "REJECTED") {
        // Hapus cuma kalo statusnya IZIN. 
        // Kalo statusnya HADIR (si anak udah masuk tapi iseng izin), jangan dihapus kehadirannya.
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
    return NextResponse.json({ message: "Server error bro" }, { status: 500 });
  }
}