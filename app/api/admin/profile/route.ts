import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Sesuaikan path authOptions lo

const prisma = new PrismaClient();

// 1. GET: Ambil Data Profile Admin Login
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      nip: true,
      jabatan: true,
    },
  });

  return NextResponse.json(user);
}

// 2. PUT: Update Data Profile
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, nip, jabatan } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        nip,
        jabatan,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update profile" }, { status: 500 });
  }
}