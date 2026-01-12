import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
<<<<<<< HEAD
  
=======
>>>>>>> 06f0845f84b5d4b89208ce7fda18ea04f654e1a0
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
<<<<<<< HEAD
    const { name, email, password, confirmPassword, image } = body; // <--- Ambil image
=======
    const { name, password, confirmPassword } = body;
>>>>>>> 06f0845f84b5d4b89208ce7fda18ea04f654e1a0

    if (password && password !== confirmPassword) {
      return NextResponse.json({ error: "Password tidak cocok" }, { status: 400 });
    }

<<<<<<< HEAD
    const updateData: any = { 
        name,
        email
    };

    // Kalau ada image baru, update juga
    if (image) {
        updateData.image = image;
    }

=======
    const updateData: any = { name };
>>>>>>> 06f0845f84b5d4b89208ce7fda18ea04f654e1a0
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
<<<<<<< HEAD
    console.error(error);
=======
>>>>>>> 06f0845f84b5d4b89208ce7fda18ea04f654e1a0
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}