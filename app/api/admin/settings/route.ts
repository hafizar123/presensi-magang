import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const configPath = path.join(process.cwd(), "settings.json");

// Helper baca config
function getSettings() {
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (err) {
    return {};
  }
}

// === GET: Boleh diakses SEMUA User (Admin & Intern) buat baca jadwal ===
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Cukup cek session aja (login), HAPUS pengecekan role !== "ADMIN"
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json(getSettings());
}

// === POST: Tetep KHUSUS ADMIN buat ngubah setting ===
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Wajib ADMIN
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentSettings = getSettings();

    // Merge setting lama dengan yang baru
    const newSettings = { ...currentSettings, ...body };

    fs.writeFileSync(configPath, JSON.stringify(newSettings, null, 2));

    return NextResponse.json({ message: "Pengaturan disimpan!", settings: newSettings });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}