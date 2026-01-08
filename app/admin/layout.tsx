import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Sidebar Tetap di Kiri */}
      <AdminSidebar />

      {/* Konten Utama di Kanan */}
      <div className="pl-64">
        <AdminHeader />
        
        {/* Children ini bakal diganti sama page.tsx lo */}
        <main className="pt-20 p-8">
            {children}
        </main>
      </div>
    </div>
  );
}