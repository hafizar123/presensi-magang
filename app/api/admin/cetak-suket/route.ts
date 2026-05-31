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

const formatTanggal = (date: any) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
};

function splitTextIntoLines(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    if (!text) return [];

    // Pisah dulu berdasarkan newline asli dari input user
    const paragraphs = text.split(/\r?\n/);
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
            lines.push("");
            continue;
        }

        const words = paragraph.trim().split(/\s+/);
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine ? currentLine + " " + word : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (testWidth <= maxWidth) {
                // Muat dalam satu baris
                currentLine = testLine;
            } else {
                // Tidak muat — simpan baris sebelumnya dulu
                if (currentLine) lines.push(currentLine);

                // Cek apakah kata itu sendiri lebih panjang dari maxWidth
                // (misal teks tanpa spasi seperti "aaaaaaa...")
                let remaining = word;
                while (font.widthOfTextAtSize(remaining, fontSize) > maxWidth) {
                    // Potong karakter per karakter sampai pas
                    let chunk = "";
                    let i = 0;
                    while (i < remaining.length) {
                        const next = chunk + remaining[i];
                        if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
                            chunk = next;
                            i++;
                        } else {
                            break;
                        }
                    }
                    lines.push(chunk);
                    remaining = remaining.slice(chunk.length);
                }
                currentLine = remaining;
            }
        }

        if (currentLine) lines.push(currentLine);
    }

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
    
    // AMBIL DARI CUSTOM PEKERJAAN
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
    firstPage.drawText(user.nomorInduk || "-", { x: 265, y: 624, size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.instansi || "-", { x: 265.5, y: 609, size: 12, font: fontRegular }); 
    firstPage.drawText(profile?.jurusan || "-", { x: 265.5, y: 593, size: 12, font: fontRegular }); 

    const divisiLines = splitTextIntoLines(user.divisi || "-", 260, fontRegular, 12);
    divisiLines.forEach((line, i) => {
        firstPage.drawText(line, { x: 265.5, y: 576 - (i * 14), size: 12, font: fontRegular });
    });
    firstPage.drawText(finalLamaHari, { x: 265.5, y: 511, size: 12, font: fontRegular });
    firstPage.drawText(finalTanggal, { x: 265.5, y: 495, size: 12, font: fontRegular });

    // 2. TABEL NILAI
    const nx = 379; const ny = 395; const nls = 18.5; 
    firstPage.drawText(String(evalData.nilaiSikap || 0), { x: nx, y: ny, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiDisiplin || 0), { x: nx, y: ny - nls, size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiTanggungJawab || 0), { x: nx, y: ny - (nls*2), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiKerjasama || 0), { x: nx, y: ny - (nls*3), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.nilaiInisiatif || 0), { x: nx, y: ny - (nls*4), size: 12, font: fontBold }); 
    firstPage.drawText(String(evalData.rataRata?.toFixed(2) || 0), { x: 372, y: 301, size: 11, font: fontBold }); 
  
    // ==========================================================
    // 3. CETAK OUTPUT PEKERJAAN 
    // ==========================================================
    const fontSizePekerjaan = 9;
    const maxWidthKotak = 340; // Lebar efektif kotak keluaran di template PDF
    const barisTeks = splitTextIntoLines(finalPekerjaan, maxWidthKotak, fontRegular, fontSizePekerjaan);

    // Looping nge-print tiap baris, turun 13 point setiap enter
    barisTeks.forEach((baris, index) => {
        firstPage.drawText(baris, {
            x: 83,
            y: 253 - (index * 13), 
            size: fontSizePekerjaan,
            font: fontRegular,
        });
    });

    // 4. TANDA TANGAN
    firstPage.drawText(`Yogyakarta, ${formatTanggal(new Date())}`, { x: 347, y: 134, size: 11, font: fontRegular });
    firstPage.drawText(finalKadis, { x: 347, y: 35, size: 11, font: fontBold });

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