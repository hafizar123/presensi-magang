import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Cek Izin yang statusnya PENDING
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5 // Ambil 5 teratas aja biar ga penuh
    });

    // 2. Cek User yang baru daftar (belum punya internProfile) - Opsional
    // Anggaplah user yang 'pending' adalah user role INTERN tapi belum ada profile
    const newUsers = await prisma.user.findMany({
      where: { 
        role: "INTERN",
        internProfile: null 
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    // 3. Format datanya biar enak dipake di Frontend
    const notifications = [
      ...pendingLeaves.map((leave) => ({
        id: `leave-${leave.id}`,
        type: "IZIN",
        title: "Pengajuan Izin Baru",
        message: `${leave.user.name} mengajukan izin.`,
        link: "/admin/izin",
        time: leave.createdAt,
      })),
      ...newUsers.map((user) => ({
        id: `user-${user.id}`,
        type: "USER",
        title: "User Belum Setup",
        message: `${user.name} belum diatur jadwalnya.`,
        link: "/admin/data-magang",
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