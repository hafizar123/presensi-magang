"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  History, FileText, User, Menu, LayoutDashboard, 
  Clock, Mail, Camera, Eye, EyeOff, Save, Lock, 
  LogOut, Settings, CheckCircle2, Building2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileClientProps { user: any; }

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  
  // STATE ANIMASI (SAMA KEK RIWAYAT/IZIN)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  
  useEffect(() => {
    setStartAnimation(true);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Profile Data State
  const [profileData, setProfileData] = useState({ 
    name: user.name || "", 
    email: user.email || "", 
    image: user.image || "",
    nip: user.nip || "",
    jabatan: user.jabatan || ""
  });

  const [opsSettings, setOpsSettings] = useState<any>(null);
  const [passData, setPassData] = useState({ new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ new: false, confirm: false });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [pendingPath, setPendingPath] = useState(""); 
  const [pendingTab, setPendingTab] = useState("");

  // --- FETCH SETTINGS ---
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            setOpsSettings(data);
        } catch (error) {
            console.error("Gagal ambil jam operasional");
        }
    };
    fetchSettings();
  }, []);

  // --- LOGIC JAM OPERASIONAL ---
  const getOperationalInfo = () => {
    if (!opsSettings) return { time: "--:--", desc: "Memuat..." };

    const today = new Date().getDay(); 
    const isWeekend = today === 0 || today === 6;
    const isFriday = today === 5;

    const startMT = opsSettings.opStartMonThu || "07:30";
    const endMT = opsSettings.opEndMonThu || "16:00";
    const startF = opsSettings.opStartFri || "07:30";
    const endF = opsSettings.opEndFri || "14:30";

    if (isWeekend) {
        return { time: "Libur", desc: "Akhir Pekan" };
    } else if (isFriday) {
        return { time: `${startF} - ${endF}`, desc: "Jumat (Khusus)" };
    } else {
        return { time: `${startMT} - ${endMT}`, desc: "Senin - Kamis" };
    }
  };

  const schedule = getOperationalInfo();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File terlalu besar", { description: "Maksimal 2MB bre." });
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setFileToUpload(file); 
        setProfileData({ ...profileData, image: previewUrl });
        setIsPhotoMenuOpen(false); 
        toast.info("Foto dipilih", { description: "Jangan lupa klik Simpan Perubahan." });
    }
  };

  const handleDeleteImage = () => {
      setFileToUpload(null);
      setProfileData({ ...profileData, image: "" });
      setIsPhotoMenuOpen(false); 
      toast.warning("Foto dihapus dari preview", { description: "Klik Simpan untuk menerapkannya." });
  };

  const checkIsDirty = () => {
     return fileToUpload !== null || 
            (user.image && !profileData.image && user.image !== "") ||
            (profileData.name !== user.name) ||
            (profileData.nip !== (user.nip || "")) ||
            (profileData.jabatan !== (user.jabatan || ""));
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (checkIsDirty()) {
        e.preventDefault();
        setPendingPath(path);
        setPendingTab(""); 
        setShowUnsavedAlert(true);
    }
  };

  const handleTabChange = (value: string) => {
    if (checkIsDirty()) {
        setPendingTab(value);
        setPendingPath(""); 
        setShowUnsavedAlert(true);
    } else {
        setActiveTab(value);
    }
  };

  const confirmDiscard = () => {
    setShowUnsavedAlert(false);
    setFileToUpload(null);
    setProfileData({ 
        name: user.name || "", 
        email: user.email || "", 
        image: user.image || "", 
        nip: user.nip || "",
        jabatan: user.jabatan || ""
    });
    if (pendingPath) router.push(pendingPath); 
    else if (pendingTab) setActiveTab(pendingTab);
  };

  const uploadFile = async () => {
    if (!fileToUpload) return null;
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.filepath;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        let finalImagePath = profileData.image;
        if (fileToUpload) {
            finalImagePath = await uploadFile();
        } else if (profileData.image === "" || profileData.image === null) {
            finalImagePath = ""; 
        }

        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: profileData.name,
                nip: profileData.nip,
                jabatan: profileData.jabatan,
                image: finalImagePath,
            }),
        });

        if (!res.ok) throw new Error("Gagal update");
        toast.success("Profil Diperbarui", { description: "Data diri berhasil disimpan." });
        setFileToUpload(null); 
        router.refresh(); 
    } catch (error) {
        toast.error("Gagal", { description: "Terjadi kesalahan saat menyimpan." });
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
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: passData.new }),
        });

        if (!res.ok) throw new Error("Gagal ganti password");

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

  // --- SIDEBAR ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#EAE7DD] dark:bg-[#0c0a09] border-r border-[#d6d3c9] dark:border-[#1c1917] transition-colors duration-300">
        <div className="h-16 flex items-center gap-3 px-6 bg-[#99775C] dark:bg-[#271c19] text-white border-b border-[#8a6b52] dark:border-[#3f2e26] transition-colors duration-300">
             <div className={`p-1.5 bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-180"}`}>
                <Image src="/logo-disdikpora.png" width={24} height={24} alt="Logo" />
             </div>
             <span className="font-bold text-lg tracking-tight">SIP-MAGANG</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2">Menu Utama</h4>
            <Link href="/" onClick={(e) => handleNavigation(e, "/")} className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <LayoutDashboard className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Dashboard
            </Link>
            <Link href="/riwayat" onClick={(e) => handleNavigation(e, "/riwayat")} className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <History className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Riwayat Presensi
            </Link>
            <Link href="/izin" onClick={(e) => handleNavigation(e, "/izin")} className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <FileText className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Pengajuan Izin
            </Link>
            <h4 className="text-xs font-semibold text-[#8a6b52] dark:text-[#99775C] uppercase tracking-wider mb-2 px-2 mt-6">Akun Pengguna</h4>
            <Link href="/profile" onClick={(e) => handleNavigation(e, "/profile")} className="flex items-center gap-3 px-4 py-3 bg-[#99775C] dark:bg-[#3f2e26] text-white rounded-xl font-bold transition-all shadow-md">
                <User className="h-5 w-5" /> Profil Saya
            </Link>
            <LogoutModal>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-all text-left mt-4">
                    <LogOut className="h-5 w-5" /> Keluar Aplikasi
                </button>
            </LogoutModal>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#0c0a09] font-sans transition-colors duration-300">
      
      <Dialog open={isPhotoMenuOpen} onOpenChange={setIsPhotoMenuOpen}>
        <DialogContent className="max-w-[350px] p-0 overflow-hidden rounded-2xl gap-0 border-none bg-white dark:bg-[#1c1c1e]">
            <DialogHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <DialogTitle className="text-center text-lg font-bold">Ubah Foto Profil</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-center text-sm font-medium">
                <button onClick={() => fileInputRef.current?.click()} className="py-4 text-[#99775C] font-bold hover:bg-slate-50 dark:hover:bg-white/5">Unggah Foto</button>
                <Separator className="dark:bg-white/10" />
                {profileData.image && !profileData.image.includes("ui-avatars.com") && (
                    <>
                        <button onClick={handleDeleteImage} className="py-4 text-red-600 font-bold hover:bg-slate-50 dark:hover:bg-white/5">Hapus Foto Saat Ini</button>
                        <Separator className="dark:bg-white/10" />
                    </>
                )}
                <button onClick={() => setIsPhotoMenuOpen(false)} className="py-4 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">Batal</button>
            </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert}>
        <AlertDialogContent className="bg-white dark:bg-[#1c1c1e]">
            <AlertDialogHeader><AlertDialogTitle>Foto Belum Disimpan!</AlertDialogTitle><AlertDialogDescription>Perubahan foto akan hilang jika tidak disimpan.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Batal (Stay)</AlertDialogCancel><AlertDialogAction onClick={confirmDiscard} className="bg-red-600 hover:bg-red-700">Lanjut (Hapus)</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button>
             <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button></SheetTrigger><SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none"><SidebarContent /></SheetContent></Sheet>
             <h1 className="font-bold text-xl text-white">Profil Saya</h1>
          </div>
          <div className="flex items-center gap-3 text-white">
            <ModeToggle />
            <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
            <Link href="/profile" className="flex items-center gap-3 pl-1 group">
                <div className="hidden md:flex flex-col items-end"><span className="text-sm font-bold group-hover:text-[#EAE7DD] transition-colors">{user.name}</span><span className="text-[10px] text-[#EAE7DD]/80 font-medium">Peserta Magang</span></div>
                <div className={`transition-all duration-1000 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
                    <Avatar className="h-9 w-9 border-2 border-white/20 group-hover:scale-105 transition-transform">
                        <AvatarImage src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} />
                        <AvatarFallback className="bg-[#5c4a3d] text-white">U</AvatarFallback>
                    </Avatar>
                </div>
            </Link>
          </div>
      </nav>

      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}><SidebarContent /></aside>

      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8 ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                
                {/* --- BAGIAN TABS DI UBAH BIAR SAMA KEK RIWAYAT (KOTAK ROUNDED-XL) --- */}
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 dark:bg-[#1c1917] p-1 rounded-xl h-auto border dark:border-[#292524]">
                        <TabsTrigger value="overview" className="py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">Ringkasan</TabsTrigger>
                        <TabsTrigger value="settings" className="py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">Edit & Keamanan</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="relative rounded-3xl overflow-hidden p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center gap-8 shadow-xl shadow-[#99775C]/20 dark:shadow-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#99775C] to-[#6d5440] dark:from-[#3f2e26] dark:to-[#1c1917]">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
                        </div>
                        <div className="relative z-10 shrink-0">
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white/20 shadow-2xl"><AvatarImage src={profileData.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="object-cover" /><AvatarFallback className="text-3xl font-bold bg-slate-100 text-[#99775C]">U</AvatarFallback></Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 p-2 rounded-full border-4 border-[#8a6b52] shadow-sm"><Building2 className="h-5 w-5" /></div>
                        </div>
                        <div className="relative z-10 text-center md:text-left text-white space-y-3 flex-1">
                            <div><h2 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name}</h2><p className="text-[#EAE7DD] text-lg font-medium opacity-90 mt-1">{user.jabatan || "Mahasiswa Magang"}</p></div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2"><div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm"><Mail className="h-3.5 w-3.5 opacity-70" /> {user.email}</div></div>
                        </div>
                        <div className="relative z-10 hidden md:block opacity-80"><Image src="/logo-disdikpora.png" width={100} height={100} alt="Logo" className="opacity-50 grayscale brightness-200" /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CARD MASA MAGANG - BG-WHITE SOLID */}
                        <Card className="border-none shadow-sm transition-all bg-white dark:bg-[#1c1917] border-l-4 border-l-[#99775C] hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Masa Magang</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4"><span className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">{progressValue}% <span className="text-sm font-normal text-slate-400">Selesai</span></span>{progressValue >= 100 ? (<Badge className="bg-blue-100 text-blue-700 border-none">Selesai</Badge>) : (<Badge className="bg-green-100 text-green-700 border-none">Aktif</Badge>)}</div>
                                <Progress value={progressValue} className="h-2 bg-slate-100 dark:bg-[#292524]" indicatorClassName="bg-[#99775C]" />
                                <p className="text-xs text-slate-400 mt-3 font-medium">{user.internProfile ? `${formatDate(user.internProfile.startDate)} - ${formatDate(user.internProfile.endDate)}` : "Belum ditentukan"}</p>
                            </CardContent>
                        </Card>
                        
                        {/* CARD JAM OP - BG-WHITE SOLID */}
                        <Card className="border-none shadow-sm transition-all bg-white dark:bg-[#1c1917] border-l-4 border-l-orange-500 hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Jam Operasional</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <div className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">
                                        {schedule.time}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-3 font-medium">{schedule.desc} (WIB)</p>
                            </CardContent>
                        </Card>

                        {/* CARD STATUS - BG-WHITE SOLID */}
                        <Card className="border-none shadow-sm transition-all bg-white dark:bg-[#1c1917] border-l-4 border-l-blue-500 hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status Akun</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="h-8 w-8 text-blue-500" /><div><span className="block font-bold text-slate-800 dark:text-[#EAE7DD]">{user.internProfile ? "Terverifikasi" : "Pending"}<span className="text-xs text-slate-400 ml-1">Database Disdikpora</span></span></div></div>
                                <p className="text-xs text-slate-400 mt-1">Data Anda aman dan terenkripsi.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* SETTINGS CARD - BG-WHITE SOLID */}
                    <Card className="border-none shadow-md bg-white dark:bg-[#1c1917]">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-slate-500" />Ubah Informasi Dasar</CardTitle><CardDescription>Update foto profil dan data diri kamu disini.</CardDescription></CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                                        <div className="relative group cursor-pointer" onClick={() => setIsPhotoMenuOpen(true)}>
                                            <Avatar className="h-24 w-24 border-2 border-slate-200"><AvatarImage src={profileData.image || `https://ui-avatars.com/api/?name=${user.name}`} className="object-cover" /><AvatarFallback>U</AvatarFallback></Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="h-6 w-6 text-white" /></div>
                                        </div>
                                        <p onClick={() => setIsPhotoMenuOpen(true)} className="text-sm font-bold text-[#99775C] cursor-pointer hover:underline">Ubah Foto Profil</p>
                                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} /></div>
                                            <div className="space-y-2"><Label>Email</Label><Input value={profileData.email} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>NIP / NIM</Label><Input value={profileData.nip} onChange={(e) => setProfileData({...profileData, nip: e.target.value})} placeholder="Masukkan NIP/NIM" /></div>
                                            <div className="space-y-2"><Label>Divisi / Jabatan</Label><Input value={profileData.jabatan} onChange={(e) => setProfileData({...profileData, jabatan: e.target.value})} placeholder="Masukkan Divisi" /></div>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-end"><Button type="submit" className="bg-[#99775C] dark:bg-[#3f2e26] hover:bg-[#7a5e48]" disabled={isLoading}>{isLoading ? "Menyimpan..." : <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</>}</Button></div>
                            </form>
                        </CardContent>
                    </Card>
                    
                    {/* PASSWORD CARD - BG-WHITE SOLID */}
                    <Card className="border-none shadow-md bg-white dark:bg-[#1c1917]">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-orange-500" />Keamanan Akun</CardTitle><CardDescription>Buat password baru untuk akun kamu.</CardDescription></CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                                <div className="space-y-2"><Label>Password Baru</Label><div className="relative"><Input type={showPass.new ? "text" : "password"} placeholder="Min. 6 karakter" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} required minLength={6} /><button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                                <div className="space-y-2"><Label>Konfirmasi Password</Label><div className="relative"><Input type={showPass.confirm ? "text" : "password"} placeholder="Ulangi password baru" value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} required minLength={6} className={passData.confirm && passData.new !== passData.confirm ? "border-red-500 focus-visible:ring-red-500" : ""} /><button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{passData.confirm && passData.new !== passData.confirm && <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>}</div>
                                <div className="pt-2"><Button type="submit" variant="secondary" disabled={isLoading || (passData.new !== passData.confirm)}>{isLoading ? "Memproses..." : "Update Password"}</Button></div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
      </main>
    </div>
  );
}