import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import IzinClient from "@/components/IzinClient";

async function getLeaveRequests(userId: string) {
  const data = await prisma.leaveRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return JSON.parse(JSON.stringify(data));
}

export default async function IzinPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const [requests, userFromDb] = await Promise.all([
    getLeaveRequests(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, divisi: true, nomorInduk: true }
    })
  ]);

  return (
    <IzinClient 
        user={userFromDb || session.user} 
        requests={requests} 
    />
  );
}