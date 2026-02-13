import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type = data.get("type") as string || "general"; // 'profile' | 'izin' | 'general'

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Tentukan Folder Tujuan
    let folderName = "others";
    if (type === "profile") folderName = "profiles";
    else if (type === "izin") folderName = "izin";

    // 2. Buat Path Lengkap (public/uploads/nama_folder)
    const uploadDir = path.join(process.cwd(), "public/uploads", folderName);

    // 3. CEK & BUAT FOLDER KALAU BELUM ADA (Penting!)
    if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    // 4. Generate Nama File Unik
    // Ganti spasi dengan underscore biar URL aman
    const safeName = file.name.replace(/\s+/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const filepath = path.join(uploadDir, filename);
    
    // 5. Simpan File ke Folder
    await writeFile(filepath, buffer);

    // 6. Balikin Path Public untuk Database
    const publicPath = `/uploads/${folderName}/${filename}`;

    return NextResponse.json({ success: true, filepath: publicPath });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" });
  }
}