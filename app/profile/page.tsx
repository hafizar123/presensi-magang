import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import ProfileClient from "@/components/ProfileClient";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { Metadata } from "next";

// Metadata cuma jalan di Server Component (File ini GABOLEH ada "use client")
export const metadata: Metadata = {
  title: "Profil Saya - SIP MAGANG",
  description: "Kelola informasi profil dan akun.",
};

// Function buat baca settingan global dengan aman
function getGlobalSettings() {
  try {
    const configPath = path.join(process.cwd(), "settings.json");
    if (fs.existsSync(configPath)) {
      const settingsData = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(settingsData);
      return {
        startHour: parsed.startHour || "07:30",
        endHour: parsed.endHour || "16:00"
      };
    }
  } catch (error) {
    console.error("Gagal baca settings.json:", error);
  }
  // Default kalo error/file ga ada
  return { startHour: "07:30", endHour: "16:00" };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 1. Ambil data user dari Database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email!! },
    include: {
        internProfile: true // Penting buat status Terverifikasi/Pending
    }
  });

  if (!user) {
    redirect("/login");
  }

  // 2. Ambil data jam dari settings.json
  const globalSettings = getGlobalSettings();

  // 3. Gabungin data user + settingan jam
  const userData = {
    ...user,
    globalSettings // Data jam dikirim ke Client Component
  };

  return (
    <ProfileClient user={userData} />
  );
}