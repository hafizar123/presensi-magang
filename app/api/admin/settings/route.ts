import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Kita simpen config di file JSON biar gampang
const configPath = path.join(process.cwd(), "settings.json");

// Default Config (Tambahin endHourFriday)
const defaultConfig = {
  latitude: "-7.8011945",
  longitude: "110.364917",
  radius: "100",
  startHour: "07:30",
  endHour: "16:00",       // Senin - Kamis
  endHourFriday: "14:30", // Khusus Jumat
};

// GET: Ambil Settingan
export async function GET() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(data);
      // Merge sama default biar kalau ada key baru ga undefined
      return NextResponse.json({ ...defaultConfig, ...parsed });
    }
    return NextResponse.json(defaultConfig);
  } catch (error) {
    return NextResponse.json(defaultConfig);
  }
}

// POST: Simpan Settingan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
    return NextResponse.json({ message: "Settings saved" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal simpan" }, { status: 500 });
  }
}