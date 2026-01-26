import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import IzinClient from "@/components/IzinClient";

const prisma = new PrismaClient();

async function getLeaveRequests(userId: string) {
  const data = await prisma.leaveRequest.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc", // Yang baru di atas
    },
  });
  
  // JSON Parse trick biar tanggal aman
  return JSON.parse(JSON.stringify(data));
}

export default async function IzinPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const requests = await getLeaveRequests(session.user.id);

  return (
    <IzinClient 
        user={session.user} 
        requests={requests} 
    />
  );
}