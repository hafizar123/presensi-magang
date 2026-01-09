import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Tambahin dark:bg-slate-950 biar background utamanya gelap pekat
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Sidebar (Tetap Dark) */}
      <AdminSidebar />

      {/* Konten Utama */}
      <div className="pl-64 transition-all duration-300">
        <AdminHeader />
        
        {/* Main Content */}
        <main className="pt-20 p-8">
            {children}
        </main>
      </div>
    </div>
  );
}