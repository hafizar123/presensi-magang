import { PrismaClient } from "@prisma/client";
import InternsTableClient from "@/components/InternsTableClient"; // Import komponen baru

const prisma = new PrismaClient();

export default async function InternsDataPage() {
  // Ambil data dari server (Sama kayak kodingan lu sebelumnya)
  const interns = await prisma.user.findMany({
    where: { role: "INTERN" },
    include: { internProfile: true },
    orderBy: { name: "asc" },
  });

  // Lempar data ke Client Component
  return <InternsTableClient interns={interns} />;
}