import AdminLayoutClient from "@/components/AdminLayoutClient";

export const metadata = {
  title: "Admin - SIP MAGANG",
  description: "Halaman Administrator",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Kita bungkus semua children pake layout client yang baru
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}