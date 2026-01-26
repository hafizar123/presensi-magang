import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import ProfileClient from "@/components/ProfileClient";

const prisma = new PrismaClient();

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      internProfile: true, // Ambil detail magang juga
    },
  });

  // Convert Date object jadi string biar aman di client
  return JSON.parse(JSON.stringify(user));
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const user = await getUserProfile(session.user.id);

  return (
    <ProfileClient user={user} />
  );
}