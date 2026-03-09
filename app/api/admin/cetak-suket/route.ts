import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

// Helper Ambil Settings
function getSettings() {
  const configPath = path.join(process.cwd(), "settings.json");
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    return {};
  }
}

// Helper Format Tanggal
const formatTanggal = (date: Date | string | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
};

// --- FUNGSI SAKTI WRAPPER TEKS ---
const wrapText = (text: string, maxWidth: number, font: any, size: number) => {
  const words = text.split(' ');
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(currentLine + ' ' + word, size);
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Akses Ditolak", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return new NextResponse("User ID Kosong", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { internProfile: true, finalEvaluation: true }
    });

    if (!user || !user.finalEvaluation) return new NextResponse("Data Tidak Ditemukan", { status: 404 });

    const evalData = user.finalEvaluation;
    const profile = user.internProfile;
    const appSettings = getSettings();

    const finalKadis = evalData.customKepalaDinas || appSettings.kepalaDinasName || "-";
    const finalLamaHari = evalData.customLamaHari || "-";
    const finalTanggal = evalData.customTanggalPelaksanaan || "-";

    const templatePath = path.join(process.cwd(), "public", "SUKET MAGANG_DRAFT APLIKASI.pdf");
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const firstPage = pdfDoc.getPages()[0]; 
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 1. DATA HEADER & DIRI (Koordinat Base Lu)
    firstPage.drawText(finalKadis, { x: 265.5, y: 700, size: 12, font: fontRegular });
    firstPage.drawText(evalData.nomorSurat || "", { x: 286, y: 765.5, size: 12, font: fontRegular });
    
    const startXData = 265.5; 
    const lineSpacing = 16; 
    const dataYStart = 641;   
    firstPage.drawText(user.name, { x: startXData, y: dataYStart, size: 12, font: fontRegular }); 
    firstPage.drawText(user.nomorInduk || "-", { x: startXData, y: dataYStart - lineSpacing, size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.instansi || "-", { x: startXData, y: dataYStart - (lineSpacing * 2), size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.jurusan || "-", { x: startXData, y: dataYStart - (lineSpacing * 3), size: 12, font: fontRegular }); 
    firstPage.drawText(user.divisi || "-", { x: startXData, y: dataYStart - (lineSpacing * 4), size: 12, font: fontRegular }); 
    firstPage.drawText(finalLamaHari, { x: startXData, y: dataYStart - (lineSpacing * 5) - 3, size: 12, font: fontRegular });
    firstPage.drawText(finalTanggal, { x: startXData, y: dataYStart - (lineSpacing * 6) - 3, size: 12, font: fontRegular });

    // 2. TABEL NILAI
    const startXNilai = 372; 
    const tableStartY = 428; 
    const tableSpacing = 18.5; 
    firstPage.drawText(String(evalData.nilaiSikap || 0), { x: startXNilai, y: tableStartY, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiDisiplin || 0), { x: startXNilai, y: tableStartY - tableSpacing, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiTanggungJawab || 0), { x: startXNilai, y: tableStartY - (tableSpacing * 2), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiKerjasama || 0), { x: startXNilai, y: tableStartY - (tableSpacing * 3), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiInisiatif || 0), { x: startXNilai, y: tableStartY - (tableSpacing * 4), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.rataRata?.toFixed(2) || 0), { x: 366, y: 333, size: 11, font: fontBold }); 

    // 3. OUTPUT MAGANG (DENGAN WRAPPER OTOMATIS)
    const teksPekerjaan = (evalData.pekerjaan || "-").replace(/\n/g, ' ');
    const wrappedLines = wrapText(teksPekerjaan, 420, fontRegular, 9);

    wrappedLines.forEach((line, index) => {
        firstPage.drawText(line, {
            x: 80,
            y: 285 - (index * 12), // Nurunin 12pt tiap baris
            size: 9,
            font: fontRegular,
        });
    });

    // 4. TANDA TANGAN
    const tglTTD = `Yogyakarta, ${formatTanggal(new Date())}`; 
    firstPage.drawText(tglTTD, { x: 380, y: 160, size: 11, font: fontRegular });
    firstPage.drawText(finalKadis, { x: 380, y: 80, size: 11, font: fontBold });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    });

  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}