import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Cek Login & Role
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Oper data user ke Client Component biar bisa nampilin Nama & Foto
  return <AdminLayoutClient user={session.user}>{children}</AdminLayoutClient>;
}