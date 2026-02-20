"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  History, FileText, User, Menu, LayoutDashboard, 
  Clock, Mail, Camera, Eye, EyeOff, Save, Lock, 
  LogOut, Settings, CheckCircle2, Building2, GraduationCap,
  Shield, Edit3, Loader2 // <-- Loader2 udah ditambahin bre
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
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
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  
  useEffect(() => {
    setStartAnimation(true);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            setOpsSettings(data);
        } catch (error) {}
    };
    fetchSettings();
  }, []);

  const getOperationalInfo = () => {
    if (!opsSettings) return { time: "--:--", desc: "Memuat..." };
    const today = new Date().getDay(); 
    const isWeekend = today === 0 || today === 6;
    const isFriday = today === 5;

    const startMT = opsSettings.opStartMonThu || "07:30";
    const endMT = opsSettings.opEndMonThu || "16:00";
    const startF = opsSettings.opStartFri || "07:30";
    const endF = opsSettings.opEndFri || "14:30";

    if (isWeekend) return { time: "Libur", desc: "Akhir Pekan" };
    else if (isFriday) return { time: `${startF} - ${endF}`, desc: "Jumat (Khusus)" };
    else return { time: `${startMT} - ${endMT}`, desc: "Senin - Kamis" };
  };

  const schedule = getOperationalInfo();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            return toast.error("File terlalu besar", { description: "Maksimal 2MB." });
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
    formData.append("type", "profile"); 

    try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.filepath;
    } catch (error) {
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
        return toast.error("Password Tidak Sama", { description: "Konfirmasi password baru tidak cocok." });
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

  const calculateProgress = () => {
    if (!user.internProfile?.startDate || !user.internProfile?.endDate) return 0;
    const start = new Date(user.internProfile.startDate).getTime();
    const end = new Date(user.internProfile.endDate).getTime();
    const today = new Date().getTime();
    if (today < start) return 0;
    if (today > end) return 100;
    return Math.round(((today - start) / (end - start)) * 100);
  };
  
  const formatDate = (date: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const progressValue = calculateProgress();

  const sidebarContent = (
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
            <Link href="/selesai-magang" onClick={(e) => handleNavigation(e, "/selesai-magang")} className="flex items-center gap-3 px-4 py-3 text-[#5c4a3d] dark:text-[#EAE7DD] hover:bg-white/50 dark:hover:bg-[#1c1917]/50 hover:text-[#99775C] dark:hover:text-white rounded-xl font-medium transition-all group">
                <GraduationCap className="h-5 w-5 group-hover:text-[#99775C] dark:group-hover:text-white" /> Selesai Magang
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
      
      {/* MODAL GANTI FOTO */}
      <Dialog open={isPhotoMenuOpen} onOpenChange={setIsPhotoMenuOpen}>
        <DialogContent className="max-w-[350px] p-0 overflow-hidden rounded-3xl gap-0 border-none bg-white dark:bg-[#1c1c1e] shadow-2xl">
            <DialogHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <DialogTitle className="text-center text-lg font-bold">Ubah Foto Profil</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-center text-sm font-medium">
                <button onClick={() => fileInputRef.current?.click()} className="py-4 text-[#99775C] font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Unggah Foto Baru</button>
                <Separator className="dark:bg-white/10" />
                {profileData.image && !profileData.image.includes("ui-avatars.com") && (
                    <>
                        <button onClick={handleDeleteImage} className="py-4 text-red-600 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Hapus Foto Saat Ini</button>
                        <Separator className="dark:bg-white/10" />
                    </>
                )}
                <button onClick={() => setIsPhotoMenuOpen(false)} className="py-4 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Batal</button>
            </div>
        </DialogContent>
      </Dialog>

      {/* ALERT BUANG PERUBAHAN */}
      <AlertDialog open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert}>
        <AlertDialogContent className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] border-none shadow-2xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Perubahan Belum Disimpan!</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">Anda memiliki perubahan profil yang belum disimpan. Yakin ingin meninggalkan halaman ini?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="rounded-xl h-11 border-slate-200">Tetap Disini</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDiscard} className="rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white font-bold">Ya, Buang Perubahan</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NAVBAR */}
      <nav className={`fixed top-0 right-0 z-30 h-16 bg-[#99775C] dark:bg-[#271c19] border-b border-[#8a6b52] dark:border-[#3f2e26] flex items-center justify-between px-6 transition-all duration-300 ease-in-out shadow-sm ${isSidebarOpen ? "left-0 md:left-[280px]" : "left-0"}`}>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button>
             <Sheet>
                 <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white"><Menu className="h-6 w-6" /></Button></SheetTrigger>
                 <SheetContent side="left" className="p-0 w-[300px] border-none bg-transparent shadow-none">
                     <SheetTitle className="hidden">Menu Navigasi</SheetTitle>
                     {sidebarContent}
                 </SheetContent>
             </Sheet>
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

      {/* SIDEBAR DESKTOP */}
      <aside className={`fixed left-0 top-0 bottom-0 z-40 w-[280px] bg-[#EAE7DD] dark:bg-[#0c0a09] shadow-xl transition-transform duration-300 ease-in-out hidden md:block ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebarContent}
      </aside>

      <main className={`pt-24 px-4 md:px-8 pb-12 transition-all duration-300 ease-in-out space-y-8 ${isSidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${startAnimation ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                
                {/* TAB NAVIGATION */}
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-200/50 dark:bg-[#1c1917] p-1.5 rounded-2xl h-auto border border-slate-200 dark:border-[#292524] shadow-sm">
                        <TabsTrigger value="overview" className="py-3 rounded-xl text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-md data-[state=active]:text-[#99775C] transition-all">Ringkasan Profil</TabsTrigger>
                        <TabsTrigger value="settings" className="py-3 rounded-xl text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-md data-[state=active]:text-[#99775C] transition-all">Edit Profil</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- TAB OVERVIEW --- */}
                <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl shadow-[#99775C]/20 dark:shadow-none bg-gradient-to-br from-[#99775C] via-[#8a6b52] to-[#6d5440] dark:from-[#3f2e26] dark:via-[#271c19] dark:to-[#1c1917]">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
                        
                        <div className="relative z-10 shrink-0">
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white/20 shadow-2xl">
                                <AvatarImage src={profileData.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="object-cover" />
                                <AvatarFallback className="text-4xl font-black bg-slate-100 text-[#99775C]">U</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 p-2.5 rounded-full border-4 border-[#8a6b52] shadow-lg"><Building2 className="h-6 w-6" /></div>
                        </div>
                        <div className="relative z-10 text-center md:text-left text-white space-y-3 flex-1 pt-2">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-sm">{user.name}</h2>
                                <p className="text-[#EAE7DD] text-lg font-medium opacity-90 mt-1 uppercase tracking-widest">{user.jabatan || "Peserta Magang"}</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-medium shadow-sm"><Mail className="h-4 w-4 text-yellow-300" /> {user.email}</div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-medium shadow-sm"><Shield className="h-4 w-4 text-green-300" /> Terverifikasi</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-[#1c1917] hover:-translate-y-1 transition-transform duration-300">
                            <CardContent className="p-6">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Progres Magang</p>
                                <div className="flex items-center justify-between mb-4"><span className="text-3xl font-black text-slate-800 dark:text-[#EAE7DD]">{progressValue}%</span>{progressValue >= 100 ? (<Badge className="bg-blue-100 text-blue-700 border-none font-bold px-3 py-1">Selesai</Badge>) : (<Badge className="bg-green-100 text-green-700 border-none font-bold px-3 py-1 animate-pulse">Aktif</Badge>)}</div>
                                <Progress value={progressValue} className="h-2.5 bg-slate-100 dark:bg-[#292524]" indicatorClassName="bg-[#99775C]" />
                                <p className="text-xs text-slate-500 mt-4 font-medium flex justify-between"><span>Start: {user.internProfile ? formatDate(user.internProfile.startDate) : "-"}</span><span>End: {user.internProfile ? formatDate(user.internProfile.endDate) : "-"}</span></p>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-[#1c1917] hover:-translate-y-1 transition-transform duration-300">
                            <CardContent className="p-6">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Waktu Operasional</p>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Clock className="h-6 w-6" /></div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-800 dark:text-[#EAE7DD]">{schedule.time}</div>
                                        <p className="text-sm text-slate-500 font-medium">{schedule.desc} (WIB)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-[#1c1917] hover:-translate-y-1 transition-transform duration-300">
                            <CardContent className="p-6">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Status Akun</p>
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${user.internProfile ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-800 dark:text-[#EAE7DD] leading-tight">{user.internProfile ? "Verified Account" : "Unverified"}</div>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Database SIP-MAGANG</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- TAB SETTINGS (KALCER UI) --- */}
                <TabsContent value="settings" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-[#1c1917] overflow-hidden">
                        
                        <div className="bg-slate-50 dark:bg-black/20 p-6 md:px-10 border-b border-slate-100 dark:border-white/5">
                            <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800 dark:text-white">
                                <div className="p-2 bg-[#99775C]/10 text-[#99775C] rounded-xl"><Edit3 className="h-5 w-5" /></div>
                                Informasi Profil
                            </CardTitle>
                            <CardDescription className="mt-1 ml-12 text-slate-500">Ubah foto profil dan data identitas diri kamu.</CardDescription>
                        </div>
                        
                        <CardContent className="p-6 md:p-10">
                            <form onSubmit={handleUpdateProfile} className="space-y-10">
                                
                                {/* AVATAR UPLOAD (CENTERED) */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative group cursor-pointer" onClick={() => setIsPhotoMenuOpen(true)}>
                                        <Avatar className="h-32 w-32 md:h-36 md:w-36 border-4 border-slate-50 dark:border-[#292524] shadow-lg transition-transform group-hover:scale-105 duration-300">
                                            <AvatarImage src={profileData.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="object-cover" />
                                            <AvatarFallback className="text-3xl font-bold bg-slate-100 text-[#99775C]">U</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 bg-[#99775C] hover:bg-[#7a5e48] text-white p-2.5 rounded-full shadow-lg transition-all active:scale-95">
                                            <Camera className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Ubah Foto Profil</p>
                                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </div>
                                
                                <Separator className="dark:bg-white/5" />

                                {/* FORM FIELDS (CLEAN GRID) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                    
                                    {/* NAMA - EDITABLE */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</Label>
                                        <Input 
                                            value={profileData.name} 
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                                            className="h-12 rounded-2xl bg-slate-50/50 hover:bg-slate-50 dark:bg-black/20 dark:hover:bg-black/40 border-slate-200 dark:border-white/10 focus:bg-white focus:ring-[#99775C] px-4 transition-colors font-normal text-slate-700 dark:text-slate-200" 
                                        />
                                    </div>
                                    
                                    {/* EMAIL - DISABLED (LOCKED AESTHETIC) */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Email Pribadi</Label>
                                        <div className="relative">
                                            <Input 
                                                value={profileData.email} 
                                                disabled 
                                                className="h-12 rounded-2xl bg-slate-100/60 dark:bg-black/40 border-dashed border-slate-200 dark:border-white/10 text-slate-400 cursor-not-allowed pr-12 font-normal" 
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 bg-slate-200/50 dark:bg-white/5 rounded-full">
                                                <Lock className="h-3 w-3 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* NIP - EDITABLE */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">NIP / NIM / NIS</Label>
                                        <Input 
                                            value={profileData.nip} 
                                            onChange={(e) => setProfileData({...profileData, nip: e.target.value})} 
                                            placeholder="Masukkan nomor identitas" 
                                            className="h-12 rounded-2xl bg-slate-50/50 hover:bg-slate-50 dark:bg-black/20 dark:hover:bg-black/40 border-slate-200 dark:border-white/10 focus:bg-white focus:ring-[#99775C] px-4 transition-colors font-normal text-slate-700 dark:text-slate-200" 
                                        />
                                    </div>
                                    
                                    {/* JABATAN - DISABLED (LOCKED AESTHETIC) */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Divisi / Penempatan</Label>
                                        <div className="relative">
                                            <Input 
                                                value={profileData.jabatan || "Belum ditentukan"} 
                                                disabled 
                                                className="h-12 rounded-2xl bg-slate-100/60 dark:bg-black/40 border-dashed border-slate-200 dark:border-white/10 text-slate-400 cursor-not-allowed pr-12 font-normal" 
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 bg-slate-200/50 dark:bg-white/5 rounded-full">
                                                <Lock className="h-3 w-3 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-6 flex justify-end">
                                    <Button type="submit" className="h-12 px-8 rounded-2xl bg-[#99775C] hover:bg-[#7a5e48] text-white font-bold shadow-xl shadow-[#99775C]/20 active:scale-95 transition-all w-full sm:w-auto" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    
                    {/* SECURITY CARD */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-[#1c1917] overflow-hidden">
                        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="w-full md:w-1/3 text-center md:text-left space-y-2">
                                <div className="mx-auto md:mx-0 h-12 w-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ganti Password</h3>
                                <p className="text-sm text-slate-500">Pastikan akun kamu selalu aman dengan memperbarui password secara berkala.</p>
                            </div>
                            
                            <div className="flex-1 w-full">
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Password Baru</Label>
                                        <div className="relative">
                                            <Input type={showPass.new ? "text" : "password"} placeholder="Minimal 6 karakter" value={passData.new} onChange={(e) => setPassData({...passData, new: e.target.value})} required minLength={6} className="h-12 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border-slate-200 pr-12 focus:bg-white focus:ring-orange-500 transition-colors font-normal text-slate-700" />
                                            <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">{showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</Label>
                                        <div className="relative">
                                            <Input type={showPass.confirm ? "text" : "password"} placeholder="Ulangi password baru" value={passData.confirm} onChange={(e) => setPassData({...passData, confirm: e.target.value})} required minLength={6} className={`h-12 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border-slate-200 pr-12 focus:bg-white focus:ring-orange-500 transition-colors font-normal text-slate-700 ${passData.confirm && passData.new !== passData.confirm ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} />
                                            <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">{showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                        </div>
                                        {passData.confirm && passData.new !== passData.confirm && <p className="text-[11px] text-red-500 font-bold ml-1">Password belum cocok.</p>}
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" variant="outline" className="h-12 px-6 rounded-2xl font-bold border-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 active:scale-95 transition-all" disabled={isLoading || (passData.new !== passData.confirm)}>
                                            {isLoading ? "Memproses..." : "Update Password"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
      </main>
    </div>
  );
}