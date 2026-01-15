import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. GET: Ambil Notifikasi (Yang belum di-dismiss)
export async function GET() {
  try {
    // A. Ambil daftar ID yang udah di-dismiss/dibuang sama admin
    const dismissedItems = await prisma.notificationDismissal.findMany();
    const dismissedIds = new Set(dismissedItems.map((item) => item.refId));

    // B. Ambil Data Mentah dari DB
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const newUsers = await prisma.user.findMany({
      where: { 
        role: "INTERN",
        internProfile: null 
      },
      orderBy: { createdAt: "desc" },
    });

    // C. Filter & Mapping (Cuma masukin yang ID-nya GAK ADA di dismissedIds)
    const notifications = [
      ...pendingLeaves
        .filter((leave) => !dismissedIds.has(leave.id)) // <--- Saringan Sakti
        .map((leave) => ({
          id: leave.id, // ID Asli DB
          displayId: `leave-${leave.id}`, // ID buat Key React
          type: "IZIN",
          title: "Pengajuan Izin Baru",
          message: `${leave.user.name} mengajukan izin.`,
          link: "/admin/izin",
          time: leave.createdAt,
        })),
      ...newUsers
        .filter((user) => !dismissedIds.has(user.id)) // <--- Saringan Sakti
        .map((user) => ({
          id: user.id,
          displayId: `user-${user.id}`,
          type: "USER",
          title: "User Belum Setup",
          message: `${user.name} belum diatur jadwalnya.`,
          link: "/admin/interns",
          time: user.createdAt,
        }))
    ];

    // Urutkan dari yang paling baru
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json(notifications);

  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// 2. POST: Dismiss Notifikasi (Biar gak muncul lagi)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body; // Array of objects: { id, type }

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Simpan ke tabel Dismissal
    // Kita pake loop biar aman, atau createMany kalo DB support (Postgres support)
    const dismissalData = ids.map((item: any) => ({
        refId: item.id,
        type: item.type
    }));

    await prisma.notificationDismissal.createMany({
        data: dismissalData,
        skipDuplicates: true, // Biar gak error kalo udah ada
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Gagal dismiss notif:", error);
    return NextResponse.json({ error: "Gagal dismiss" }, { status: 500 });
  }
}