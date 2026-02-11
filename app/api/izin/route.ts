// app/api/izin/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs";

// --- HELPER BUAT BERSIH-BERSIH FILE ---
async function autoCleanupEvidence() {
  try {
    // 1. Tentuin batas waktu (Hari ini - 10 hari)
    const HARI_EXPIRED = 10; 
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - HARI_EXPIRED);

    console.log(`🧹 Running Auto-Cleanup: Nyari file izin sebelum ${thresholdDate.toISOString()}...`);

    // 2. Cari data izin yang TANGGALNYA udah lewat & masih punya proofFile
    const oldRequests = await prisma.leaveRequest.findMany({
      where: {
        date: {
          lt: thresholdDate, // Less than (sebelum) tanggal batas
        },
        proofFile: {
          not: null, // Yang masih ada filenya aja
        },
      },
      select: { id: true, proofFile: true } // Ambil ID sama nama filenya doang
    });

    if (oldRequests.length === 0) {
      console.log("✅ Aman bre, ga ada file sampah.");
      return;
    }

    console.log(`🗑️ Nemu ${oldRequests.length} file expired. Gas hapus!`);

    // 3. Looping buat hapus file fisik & update DB
    for (const req of oldRequests) {
      if (req.proofFile) {
        // A. Hapus file fisik di folder public/uploads
        const filePath = path.join(process.cwd(), "public", req.proofFile);
        
        if (fs.existsSync(filePath)) {
          try {
            await unlink(filePath);
            console.log(`Deleted file: ${req.proofFile}`);
          } catch (err) {
            console.error(`Gagal hapus file ${req.proofFile}:`, err);
          }
        }

        // B. Update Database: Set proofFile jadi NULL (History izin tetep ada)
        await prisma.leaveRequest.update({
          where: { id: req.id },
          data: { proofFile: null }
        });
      }
    }
  } catch (error) {
    console.error("⚠️ Error pas auto-cleanup:", error);
    // Kita ga throw error biar proses submit izin utama ga keganggu cuma gara2 fitur bersih2
  }
}

// --- MAIN API HANDLER ---

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔥 TRIGGER CLEANUP DI SINI 🔥
    // Kita jalanin background aja (ga usah di-await) biar user ga nunggu lama loadingnya
    autoCleanupEvidence(); 

    // Ambil data dari body request
    const body = await req.json();
    const { date, reason, proofFile } = body;

    console.log("📥 API IZIN RECEIVED DATA:", { date, reason, proofFile });

    if (!date || !reason) {
        return NextResponse.json({ message: "Tanggal dan Alasan wajib diisi." }, { status: 400 });
    }

    // Validasi Tanggal
    const izinDate = new Date(date);
    if (isNaN(izinDate.getTime())) {
        return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
    }

    // Simpan ke Database
    const finalProofFile = proofFile && proofFile.trim() !== "" ? proofFile : null;

    await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        date: izinDate,
        reason: reason,
        proofFile: finalProofFile,
        status: "PENDING",
      },
    });

    console.log("Izin berhasil diajukan");

    return NextResponse.json({ message: "Pengajuan izin berhasil dikirim." });

  } catch (error) {
    console.error("Error submit izin:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}