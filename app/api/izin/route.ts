import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs";

// Helper: Bersih-bersih file bukti lama
async function cleanupOldEvidence() {
    try {
        const EXPIRE_DAYS = 7; // Hapus file setelah 7 hari
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - EXPIRE_DAYS);

        // Cari izin yg tanggalnya < 7 hari lalu DAN masih punya file
        const expiredRequests = await prisma.leaveRequest.findMany({
            where: {
                date: { lt: thresholdDate }, 
                proofFile: { not: null }
            },
            select: { id: true, proofFile: true }
        });

        if (expiredRequests.length > 0) {
            console.log(`🧹 Auto-Cleanup: Menghapus ${expiredRequests.length} file bukti lama...`);
            
            for (const req of expiredRequests) {
                if (req.proofFile && req.proofFile.startsWith("/uploads/")) {
                    const filePath = path.join(process.cwd(), "public", req.proofFile);
                    
                    // 1. Hapus File Fisik
                    if (fs.existsSync(filePath)) {
                        try {
                            await unlink(filePath);
                            console.log(`✅ Deleted file: ${req.proofFile}`);
                        } catch (err) {
                            console.error(`❌ Gagal hapus ${req.proofFile}`, err);
                        }
                    }

                    // 2. Update DB jadi NULL (biar hemat database juga)
                    await prisma.leaveRequest.update({
                        where: { id: req.id },
                        data: { proofFile: null } 
                    });
                }
            }
        }
    } catch (error) {
        console.error("Auto-cleanup error:", error);
    }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔥 JALANIN CLEANUP DI BACKGROUND 🔥
    // Gak usah pake await, biar user gak nungguin proses bersih-bersih
    cleanupOldEvidence();

    const body = await req.json();
    const { date, reason, proofFile } = body;

    if (!date || !reason) {
        return NextResponse.json({ message: "Tanggal dan Alasan wajib diisi." }, { status: 400 });
    }

    const izinDate = new Date(date);
    if (isNaN(izinDate.getTime())) {
        return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    // Simpan data baru
    await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        date: izinDate,
        reason: reason,
        proofFile: proofFile || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Pengajuan izin berhasil dikirim." });

  } catch (error) {
    console.error("Error submit izin:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    // Ambil history izin user
    const requests = await prisma.leaveRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' }
    });

    return NextResponse.json(requests);
}