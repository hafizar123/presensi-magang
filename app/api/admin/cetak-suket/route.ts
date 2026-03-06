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

    // 1. NOMOR SURAT
    firstPage.drawText(evalData.nomorSurat || "", {
        x: 286, 
        y: 765.5, 
        size: 12, 
        font: fontRegular, 
        color: textColor,
    });

    // 2. DATA DIRI PESERTA 
    // X: 228
    const startXData = 265.5; 
    const lineSpacing = 16; 
    const dataYStart = 641;   
    
    firstPage.drawText(user.name, { x: startXData, y: dataYStart, size: 12, font: fontRegular }); 
    firstPage.drawText(user.nomorInduk || "-", { x: startXData, y: dataYStart - lineSpacing, size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.instansi || "-", { x: startXData, y: dataYStart - (lineSpacing * 2), size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.jurusan || "-", { x: startXData, y: dataYStart - (lineSpacing * 3), size: 12, font: fontRegular }); 
    firstPage.drawText(user.divisi || "-", { x: startXData, y: dataYStart - (lineSpacing * 4), size: 12, font: fontRegular }); 

    // 3. ASPEK PENILAIAN DI TABEL 
    // Sesuaikan X agar center di kolom nilai (biasanya antara 360-380)
    const startXNilai = 372; 
    const tableStartY = 428; 
    const tableSpacing = 18.5; 

    firstPage.drawText(String(evalData.nilaiSikap || 0), { x: startXNilai, y: tableStartY, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiDisiplin || 0), { x: startXNilai, y: tableStartY - tableSpacing, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiTanggungJawab || 0), { x: startXNilai, y: tableStartY - (tableSpacing * 2), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiKerjasama || 0), { x: startXNilai, y: tableStartY - (tableSpacing * 3), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiInisiatif || 0), { x: startXNilai, y: tableStartY - (tableSpacing * 4), size: 12, font: fontBold }); 

    // 4. RATA-RATA (Baris bawah tabel)
    firstPage.drawText(String(evalData.rataRata?.toFixed(2) || 0), { x: 366, y: 333, size: 11, font: fontBold }); 

    // 5. OUTPUT MAGANG
    firstPage.drawText(evalData.pekerjaan || "-", { 
        x: 80, 
        y: 285, 
        size: 9, 
        font: fontRegular, 
        maxWidth: 460, 
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