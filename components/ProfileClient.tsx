"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, History, FileText, User, Menu, LayoutDashboard, 
  Clock, Mail, MapPin, Shield, Camera, Eye, EyeOff, Save, Lock, 
  LogOut, Settings, CheckCircle2, Building2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle"; 
import LogoutModal from "@/components/LogoutModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress"; 

interface ProfileClientProps {
  user: any;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE ---
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    image: user.image || "", 
  });
  const [passData, setPassData] = useState({ new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ new: false, confirm: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC FUNCTIONS (Tetap) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const previewUrl = URL.createObjectURL(file);
        setProfileData({ ...profileData, image: previewUrl });
        toast.info("Foto dipilih", { description: "Jangan lupa klik Simpan Perubahan." });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await new Promise(r => setTimeout(r, 1000)); 
        toast.success("Profil Diperbarui", { description: "Data diri berhasil disimpan." });
        router.refresh();
    } catch (error) {
        toast.error("Gagal", { description: "Terjadi kesalahan." });
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
        toast.error("Password Tidak Sama", { description: "Konfirmasi password baru tidak cocok." });
        return;
    }
    setIsLoading(true);
    try {
        await new Promise(r => setTimeout(r, 1000));
        setPassData({ new: "", confirm: "" }); 
        toast.success("Password Diganti", { description: "Silakan login ulang jika diperlukan." });
    } catch (error) {
        toast.error("Gagal", { description: "Terjadi kesalahan." });
    } finally {
        setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const calculateProgress = () => {
    if (!user.internProfile?.startDate || !user.internProfile?.endDate) return 0;
    const start = new Date(user.internProfile.startDate).getTime();
    const end = new Date(user.internProfile.endDate).getTime();
    const today = new Date().getTime();
    if (today < start) return 0;
    if (today > end) return 100;
    const totalDuration = end - start;
    const elapsed = today - start;
    return Math.round((elapsed / totalDuration) * 100);
  };
  const progressValue = calculateProgress();

  // --- SIDEBAR (MAROON) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#450a0a] dark:bg-[#2a0505] border-r border-[#5c0e0e] dark:border-[#3d0808] text-white">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#5c0e0e] dark:border-[#3d0808]">
             <div className="p-1.5 bg-white rounded-lg">
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg text-white tracking-tight">Dinas DIKPORA</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-red-200/50 uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Dashboard
            </Link>
            <Link href="/riwayat" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Riwayat Presensi
            </Link>
            <Link href="/izin" className="flex items-center gap-3 px-4 py-3 text-red-100/70 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-all group">
                <FileText className="h-5 w-5 opacity-70 group-hover:opacity-100" /> Pengajuan Izin
            </Link>
            
            <h4 className="text-xs font-semibold text-red-200/50 uppercase tracking-wider mb-2 px-2 mt-6">Akun Pengguna</h4>
            
            {/* Active State: Profile */}
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-bold transition-all shadow-lg border border-white/10 backdrop-blur-sm">
                <User className="h-5 w-5" /> Profil Saya
            </Link>
            
            <LogoutModal>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-950/50 hover:text-red-200 rounded-xl font-medium transition-all text-left">
                    <LogOut className="h-5 w-5" /> Keluar Aplikasi
                </button>
            </LogoutModal>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`} 
      >
          <div className="flex items-center gap-4">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
             >
                <Menu className="h-6 w-6" />
             </Button>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 text-slate-600">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                    <SidebarContent />
                </SheetContent>
             </Sheet>
             <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Profil Saya</h1>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>
            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#450a0a] transition-colors">{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Peserta Magang</span>
                </div>
                <Avatar className="h-9 w-9 border border-slate-200 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                    <AvatarFallback className="bg-[#450a0a] text-white">U</AvatarFallback>
                </Avatar>
            </Link>
          </div>
      </nav>

      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#450a0a] shadow-2xl transition-transform duration-300 ease-in-out hidden md:block
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main 
        className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8
            ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}
        `}
      >
        
        {/* TABS (Active ganti Merah Maroon) */}
        <Tabs defaultValue="overview" className="w-full">
            <div className="flex justify-center mb-8">
                <TabsList className="bg-slate-200/60 dark:bg-slate-800 p-1.5 rounded-full h-14 w-full max-w-sm grid grid-cols-2 gap-2 shadow-inner">
                    <TabsTrigger value="overview" className="rounded-full h-full text-slate-500 font-semibold data-[state=active]:bg-[#450a0a] data-[state=active]:text-white transition-all">
                        Profile Utama
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-full h-full text-slate-500 font-semibold data-[state=active]:bg-[#450a0a] data-[state=active]:text-white transition-all">
                        Edit & Keamanan
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* --- TAB 1: OVERVIEW --- */}
            <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                
                {/* 1. IDENTITY CARD (Gradient Maroon) */}
                <div className="relative rounded-3xl overflow-hidden p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center gap-8 shadow-xl shadow-red-900/10">
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-[#450a0a] to-[#7f1d1d]">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
                    </div>

                    <div className="relative z-10 shrink-0">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white/20 shadow-2xl">
                            <AvatarImage src={profileData.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="object-cover" />
                            <AvatarFallback className="text-3xl font-bold bg-slate-100 text-[#450a0a]">U</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 p-2 rounded-full border-4 border-[#5c0e0e] shadow-sm">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="relative z-10 text-center md:text-left text-white space-y-3 flex-1">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name}</h2>
                            <p className="text-red-100 text-lg font-medium opacity-90 mt-1">
                                {user.jabatan || "Mahasiswa Magang"}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm">
                                <Mail className="h-3.5 w-3.5 opacity-70" /> {user.email}
                             </div>
                        </div>
                    </div>

                    <div className="relative z-10 hidden md:block opacity-80">
                         <Image src="/logo-disdikpora.png" width={100} height={100} alt="Logo" className="opacity-50 grayscale brightness-200" />
                    </div>
                </div>

                {/* 2. GRID WIDGETS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Widget 1: Durasi Magang (Maroon) */}
                    <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 border-l-4 border-l-[#450a0a]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Masa Magang</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    {progressValue}% <span className="text-sm font-normal text-slate-400">Selesai</span>
                                </span>
                                {progressValue >= 100 ? (
                                    <Badge className="bg-blue-100 text-blue-700 border-none">Selesai</Badge>
                                ) : (
                                    <Badge className="bg-green-100 text-green-700 border-none">Aktif</Badge>
                                )}
                            </div>
                            
                            {/* Progress Bar Maroon */}
                            <Progress 
                                value={progressValue} 
                                className="h-2 bg-slate-100 dark:bg-slate-800" 
                                indicatorClassName="bg-[#450a0a]" 
                            />
                            
                            <p className="text-xs text-slate-400 mt-3 font-medium">
                                {user.internProfile ? `${formatDate(user.internProfile.startDate)} - ${formatDate(user.internProfile.endDate)}` : "Belum ditentukan"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Widget 2 & 3 tetap warna Orange/Blue biar beda konteks */}
                    <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Jam Operasional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    {user.internProfile ? user.internProfile.startHour : "07:30"}
                                    <span className="text-slate-300 mx-2 font-light">-</span>
                                    {user.internProfile ? user.internProfile.endHour : "16:00"}
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-3 font-medium">Waktu Indonesia Barat (WIB)</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status Akun</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="h-8 w-8 text-blue-500" />
                                <div>
                                    <span className="block font-bold text-slate-800 dark:text-slate-100">Terverifikasi</span>
                                    <span className="text-xs text-slate-400">Database Disdikpora</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Data Anda aman dan terenkripsi.</p>
                        </CardContent>
                    </Card>

                </div>
            </TabsContent>

            {/* --- TAB 2: SETTINGS --- */}
            <TabsContent value="settings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-500" />
                            Ubah Informasi Dasar
                        </CardTitle>
                        <CardDescription>Update foto profil dan nama kamu disini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Avatar className="h-20 w-20 border-2 border-slate-200">
                                        <AvatarImage src={profileData.image || `https://ui-avatars.com/api/?name=${user.name}`} className="object-cover" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Foto Profil</p>
                                    <p className="text-xs text-slate-500 mb-2">Klik foto untuk mengganti.</p>
                                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        Pilih Foto
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Lengkap</Label>
                                    <Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={profileData.email} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                {/* Button Maroon */}
                                <Button type="submit" className="bg-[#450a0a] hover:bg-[#5c0e0e]" disabled={isLoading}>
                                    {isLoading ? "Menyimpan..." : <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Form (Tetap sama logicnya) */}
                <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-orange-500" />
                            Keamanan Akun
                        </CardTitle>
                        <CardDescription>Buat password baru untuk akun kamu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <Label>Password Baru</Label>
                                <div className="relative">
                                    <Input type={showPass.new ? "text" : "password"} placeholder="Min. 6 karakter" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} required minLength={6} />
                                    <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Konfirmasi Password</Label>
                                <div className="relative">
                                    <Input type={showPass.confirm ? "text" : "password"} placeholder="Ulangi password baru" value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} required minLength={6} className={passData.confirm && passData.new !== passData.confirm ? "border-red-500 focus-visible:ring-red-500" : ""} />
                                    <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passData.confirm && passData.new !== passData.confirm && <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>}
                            </div>
                            <div className="pt-2">
                                <Button type="submit" variant="secondary" disabled={isLoading || (passData.new !== passData.confirm)}>
                                    {isLoading ? "Memproses..." : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}