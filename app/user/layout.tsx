import UserHeader from "@/components/UserHeader";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <UserHeader />
      <main className="container mx-auto py-6 px-4 md:px-8">
        {children}
      </main>
    </div>
  );
}