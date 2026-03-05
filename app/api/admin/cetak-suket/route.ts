import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    // 1. Cek Autentikasi Admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Akses Ditolak. Khusus Admin.", { status: 401 });
    }

    // 2. Ambil parameter userId dari URL (?userId=cuid...)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID tidak ditemukan", { status: 400 });
    }

    // 3. Ambil data User beserta profil dan nilainya
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        internProfile: true,
        finalEvaluation: true
      }
    });

    if (!user || !user.finalEvaluation || user.finalEvaluation.status !== "GRADED") {
      return new NextResponse("Data penilaian belum lengkap atau user tidak ditemukan.", { status: 400 });
    }

    const evalData = user.finalEvaluation;
    const profile = user.internProfile;

    // 4. Load Template PDF dari folder public
    const templatePath = path.join(process.cwd(), "public", "SUKET MAGANG_DRAFT APLIKASI.pdf");
    
    if (!fs.existsSync(templatePath)) {
      return new NextResponse("Template PDF tidak ditemukan di server.", { status: 404 });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Kita main di halaman pertama
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 
    
    // Load Font standar
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const textColor = rgb(0, 0, 0); // Warna Hitam

    // =========================================================================
    // ⚠️ KORDINAT X, Y BISA LU SESUAIKAN LAGI KALO MASIH MELeset
    // Titik 0,0 ada di Pojok Kiri Bawah kertas.
    // =========================================================================

    // NULIS NOMOR SURAT 
    firstPage.drawText(evalData.nomorSurat || "", {
        x: 120, y: 695, size: 11, font: fontBold, color: textColor
    });

    // NULIS DATA DIRI (X disamain biar lurus setelah tanda titik dua ":")
    const startXData = 220; 
    firstPage.drawText(`: ${user.name}`, { x: startXData, y: 585, size: 11, font: fontRegular }); 
    firstPage.drawText(`: ${user.nomorInduk || "-"}`, { x: startXData, y: 565, size: 11, font: fontRegular }); 
    firstPage.drawText(`: ${profile?.instansi || "-"}`, { x: startXData, y: 545, size: 11, font: fontRegular }); 
    firstPage.drawText(`: ${profile?.jurusan || "-"}`, { x: startXData, y: 525, size: 11, font: fontRegular }); 
    firstPage.drawText(`: ${user.divisi || "-"}`, { x: startXData, y: 505, size: 11, font: fontRegular }); 

    // NULIS ASPEK PENILAIAN DI TABEL 
    const startXNilai = 450; 
    firstPage.drawText(String(evalData.nilaiSikap || 0), { x: startXNilai, y: 395, size: 11, font: fontRegular }); 
    firstPage.drawText(String(evalData.nilaiDisiplin || 0), { x: startXNilai, y: 375, size: 11, font: fontRegular }); 
    firstPage.drawText(String(evalData.nilaiTanggungJawab || 0), { x: startXNilai, y: 355, size: 11, font: fontRegular }); 
    firstPage.drawText(String(evalData.nilaiKerjasama || 0), { x: startXNilai, y: 335, size: 11, font: fontRegular }); 
    firstPage.drawText(String(evalData.nilaiInisiatif || 0), { x: startXNilai, y: 315, size: 11, font: fontRegular }); 

    // NULIS RATA-RATA
    firstPage.drawText(String(evalData.rataRata?.toFixed(2) || 0), { x: startXNilai, y: 285, size: 11, font: fontBold }); 

    // NULIS KELUARAN KARYA / PEKERJAAN
    firstPage.drawText(evalData.pekerjaan || "-", { 
        x: 80, 
        y: 220, 
        size: 10, 
        font: fontRegular, 
        maxWidth: 440, 
        lineHeight: 14 
    });

    // 5. Simpan PDF
    const pdfBytes = await pdfDoc.save();

    // FIX ERROR: Bungkus pake Buffer.from()
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Suket_Magang_${user.name}.pdf"`, 
      },
    });

  } catch (error) {
    console.error("Error Generate PDF:", error);
    return new NextResponse("Terjadi kesalahan saat mencetak PDF", { status: 500 });
  }
}