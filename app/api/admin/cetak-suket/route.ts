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
const formatTanggal = (date: any) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
};

// --- FUNGSI SAKTI PEMOTONG TEKS ANTI-BABLAS ---
function splitTextIntoLines(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    if (!text) return [];
    // Ganti semua jenis enter dengan spasi biar nyambung dan gampang dipotong per lebar kotak
    const cleanText = text.replace(/[\r\n]+/g, ' '); 
    // Pisah per kata (berdasarkan spasi) secara dinamis
    const words = cleanText.split(/\s+/);
    
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return new NextResponse("Akses Ditolak", { status: 401 });

    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) return new NextResponse("User ID Kosong", { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { internProfile: true, finalEvaluation: true } });
    if (!user || !user.finalEvaluation) return new NextResponse("Data Tidak Ditemukan", { status: 404 });

    const evalData = user.finalEvaluation;
    const profile = user.internProfile;
    const appSettings = getSettings();

    // Hitung Hari Kerja buat fallback
    const hitungHariKerja = (start: any, end: any) => {
        if (!start || !end) return 0;
        let count = 0; let curDate = new Date(start); const endDate = new Date(end);
        while (curDate <= endDate) {
            const day = curDate.getDay();
            if (day !== 0 && day !== 6) count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    };

    const defStart = profile?.startDate || null;
    const defEnd = profile?.endDate || null;
    
    const finalKadis = evalData.customKepalaDinas || appSettings.kepalaDinasName || "-";
    const finalLamaHari = evalData.customLamaHari || `${hitungHariKerja(defStart, defEnd)} Hari Kerja`;
    const finalTanggal = evalData.customTanggalPelaksanaan || `${formatTanggal(defStart)} s.d ${formatTanggal(defEnd)}`;
    
    // AMBIL DARI CUSTOM PEKERJAAN (Editan Admin), KALO KOSONG BARU PAKE ASLI PESERTA
    const finalPekerjaan = evalData.customPekerjaan || evalData.pekerjaan || "-";

    const pdfPath = path.join(process.cwd(), "public", "SUKET MAGANG_DRAFT APLIKASI.pdf");
    if (!fs.existsSync(pdfPath)) return new NextResponse("Template PDF tidak ditemukan", { status: 404 });

    const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
    const firstPage = pdfDoc.getPages()[0]; 
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const textColor = rgb(0, 0, 0);

    // 1. HEADER & DATA DIRI
    firstPage.drawText(finalKadis, { x: 265.5, y: 720, size: 12, font: fontRegular, color: textColor });
    firstPage.drawText(evalData.nomorSurat || "", { x: 286, y: 765.5, size: 12, font: fontRegular, color: textColor });
    
    firstPage.drawText(user.name, { x: 265.5, y: 641, size: 12, font: fontRegular }); 
    firstPage.drawText(user.nomorInduk || "-", { x: 265.5, y: 624, size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.instansi || "-", { x: 265.5, y: 609, size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.jurusan || "-", { x: 265.5, y: 593, size: 12, font: fontRegular }); 
    firstPage.drawText(user.divisi || "-", { x: 265.5, y: 576, size: 12, font: fontRegular }); 
    firstPage.drawText(finalLamaHari, { x: 265.5, y: 511, size: 12, font: fontRegular });
    firstPage.drawText(finalTanggal, { x: 265.5, y: 495, size: 12, font: fontRegular });

    // 2. TABEL NILAI
    const nx = 372; const ny = 428; const nls = 18.5; 
    firstPage.drawText(String(evalData.nilaiSikap || 0), { x: nx, y: ny, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiDisiplin || 0), { x: nx, y: ny - nls, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiTanggungJawab || 0), { x: nx, y: ny - (nls*2), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiKerjasama || 0), { x: nx, y: ny - (nls*3), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiInisiatif || 0), { x: nx, y: ny - (nls*4), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.rataRata?.toFixed(2) || 0), { x: 366, y: 333, size: 11, font: fontBold }); 

    // ==========================================================
    // 3. CETAK OUTPUT PEKERJAAN (UDAH DIPOTONG OTOMATIS)
    // ==========================================================
    const fontSizePekerjaan = 9;
    const maxWidthKotak = 400; // Dibikin bener-bener presisi biar ga nabrak margin kanan
    const barisTeks = splitTextIntoLines(finalPekerjaan, maxWidthKotak, fontRegular, fontSizePekerjaan);

    // Looping nge-print tiap baris, turun 13 point setiap enter
    barisTeks.forEach((baris, index) => {
        firstPage.drawText(baris, {
            x: 80,
            y: 285 - (index * 13), 
            size: fontSizePekerjaan,
            font: fontRegular,
        });
    });

    // 4. TANDA TANGAN
    firstPage.drawText(`Yogyakarta, ${formatTanggal(new Date())}`, { x: 380, y: 160, size: 11, font: fontRegular });
    firstPage.drawText(finalKadis, { x: 380, y: 80, size: 11, font: fontBold });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), { 
        status: 200, 
        headers: { 
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="Suket_Magang_${user.name}.pdf"`, 
        } 
    });
  } catch (error) { 
    console.error(error);
    return new NextResponse("Error generate PDF", { status: 500 }); 
  }
}