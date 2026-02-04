"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Shield, MapPin, Save, Building, AlertCircle, 
  CheckCircle2, Eye, EyeOff, Lock, Loader2, XCircle, Clock, CalendarDays, MousePointerClick
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// 1. DEFINISI PROPS (SOLUSI ERROR)
interface AdminSettingsClientProps {
  user: any;
}

export default function AdminSettingsClient({ user }: AdminSettingsClientProps) {
  const { update } = useSession(); // Kita tetep butuh ini buat update session kalau ganti nama
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Data Profil (LANGSUNG DARI PROPS - LEBIH CEPAT)
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    nip: user.nip || "",       // Kalau di session belum ada, nanti di-update pas fetch
    jabatan: user.jabatan || "" // Sama, ini buat initial render aja biar ga kosong
  });

  // 2. Data Pengaturan
  const [settingsData, setSettingsData] = useState({
    latitude: "",
    longitude: "",
    radius: "",
    opStartMonThu: "07:30",
    opEndMonThu: "16:00",
    opStartFri: "07:30",
    opEndFri: "14:30",
    attendanceStart: "06:00",
    attendanceLimit: "07:30",
  });

  // 3. Data Keamanan
  const [securityData, setSecurityData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    // Fetch Profil (Buat dapetin data yg mungkin ga ada di session, misal NIP/Jabatan)
    fetch("/api/admin/profile")
      .then(res => res.json())
      .then(data => {
        if(data) {
            setProfileData(prev => ({
                ...prev,
                name: data.name || prev.name,
                email: data.email || prev.email,
                nip: data.nip || "",
                jabatan: data.jabatan || ""
            }));
        }
      })
      .catch(err => console.error("Gagal load profile", err));
    
    // Fetch Settings
    fetch("/api/admin/settings")
        .then(res => res.json())
        .then(data => {
            setSettingsData(prev => ({ ...prev, ...data }));
        })
        .catch(err => console.error("Gagal load settings", err));
  }, []);

  // --- HANDLERS ---

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
        const res = await fetch("/api/admin/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: profileData.name,
                nip: profileData.nip,
                jabatan: profileData.jabatan
            })
        });

        if (res.ok) {
            // Update session client-side biar nama di navbar berubah langsung
            await update({ name: profileData.name });
            setSuccessMessage("Profil admin berhasil diperbarui!");
            setShowSuccess(true);
            router.refresh();
        } else {
            setErrorMessage("Gagal menyimpan profil.");
            setShowError(true);
        }
    } catch (error) {
        setErrorMessage("Terjadi kesalahan server.");
        setShowError(true);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
        const res = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settingsData)
        });
        if(res.ok) {
            setSuccessMessage("Pengaturan sistem berhasil disimpan!");
            setShowSuccess(true);
        } else {
            setErrorMessage("Gagal menyimpan pengaturan.");
            setShowError(true);
        }
    } catch (error) {
        setErrorMessage("Terjadi kesalahan sistem.");
        setShowError(true);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword) {
        setErrorMessage("Form password belum lengkap!");
        setShowError(true);
        return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
        setErrorMessage("Password dan konfirmasi tidak cocok!");
        setShowError(true);
        return;
    }

    setLoading(true);
    try {
        // Panggil API Ganti Password (pakai endpoint profile yang udah ada logic-nya)
        const res = await fetch("/api/admin/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: securityData.newPassword })
        });

        if (res.ok) {
            setSuccessMessage("Password berhasil diubah!");
            setShowSuccess(true);
            setSecurityData({ newPassword: "", confirmPassword: "" });
        } else {
            setErrorMessage("Gagal mengubah password.");
            setShowError(true);
        }
    } catch (e) {
        setErrorMessage("Gagal koneksi server.");
        setShowError(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* DIALOG SUCCESS & ERROR */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Berhasil!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm">{successMessage}</p>
                <Button onClick={() => setShowSuccess(false)} className="mt-6 bg-[#99775C] hover:bg-[#86664d] text-white w-full rounded-xl">Tutup</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Gagal!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm">{errorMessage}</p>
                <Button onClick={() => setShowError(false)} className="mt-6 bg-red-600 hover:bg-red-700 text-white w-full rounded-xl">Coba Lagi</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Pengaturan Sistem</h1>
        <p className="text-slate-500 dark:text-gray-400">Kelola profil admin, jam operasional, dan lokasi kantor.</p>
      </div>

      {/* TABS NAVIGATION (4 TAB) */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-[#1c1917] p-1 rounded-xl h-auto border dark:border-[#292524] mb-6">
          <TabsTrigger value="profile" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">
            <User className="h-4 w-4 mr-2" /> Profil Admin
          </TabsTrigger>
          <TabsTrigger value="time" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">
            <Clock className="h-4 w-4 mr-2" /> Waktu & Presensi
          </TabsTrigger>
          <TabsTrigger value="location" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">
            <MapPin className="h-4 w-4 mr-2" /> Lokasi Kantor
          </TabsTrigger>
          <TabsTrigger value="security" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">
            <Shield className="h-4 w-4 mr-2" /> Keamanan
          </TabsTrigger>
        </TabsList>

        {/* --- 1. TAB PROFIL ADMIN --- */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
             <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
              <CardTitle className="text-slate-900 dark:text-[#EAE7DD]">Informasi Dasar</CardTitle>
              <CardDescription>Nama ini yang akan muncul di dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-[#99775C]" />
                        <Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="pl-9 h-11" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Email Dinas</Label>
                    <Input value={profileData.email} disabled className="h-11 bg-slate-100 dark:bg-black/20" />
                </div>
                <div className="space-y-2">
                    <Label>NIP / ID Pegawai</Label>
                    <Input value={profileData.nip} onChange={(e) => setProfileData({...profileData, nip: e.target.value})} className="h-11" placeholder="198xxx" />
                </div>
                <div className="space-y-2">
                    <Label>Jabatan</Label>
                    <Input value={profileData.jabatan} onChange={(e) => setProfileData({...profileData, jabatan: e.target.value})} className="h-11" placeholder="Administrator" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                <Button onClick={handleSaveProfile} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Profil
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 2. TAB WAKTU & PRESENSI (NEW) --- */}
        <TabsContent value="time" className="space-y-6">
            
            {/* KARTU 1: WAKTU OPERASIONAL */}
            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                    <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#99775C]" /> Waktu Operasional Kantor
                    </CardTitle>
                    <CardDescription>Atur jam kerja untuk hari biasa dan khusus hari Jumat.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Senin - Kamis */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="h-4 w-4 text-blue-500" /> Senin - Kamis
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Mulai</Label>
                                <Input type="time" className="h-11" value={settingsData.opStartMonThu} onChange={(e) => setSettingsData({...settingsData, opStartMonThu: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Selesai</Label>
                                <Input type="time" className="h-11" value={settingsData.opEndMonThu} onChange={(e) => setSettingsData({...settingsData, opEndMonThu: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-[#292524]" />

                    {/* Jumat */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="h-4 w-4 text-green-500" /> Khusus Jumat
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Mulai</Label>
                                <Input type="time" className="h-11" value={settingsData.opStartFri} onChange={(e) => setSettingsData({...settingsData, opStartFri: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Selesai</Label>
                                <Input type="time" className="h-11" value={settingsData.opEndFri} onChange={(e) => setSettingsData({...settingsData, opEndFri: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KARTU 2: LOGIKA PRESENSI */}
            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                    <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                        <MousePointerClick className="h-5 w-5 text-[#99775C]" /> Logika Presensi
                    </CardTitle>
                    <CardDescription>Atur kapan tombol absen muncul dan batas keterlambatan.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    
                    {/* PRESENSI MASUK */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-l-4 border-[#99775C] pl-2">1. Presensi Masuk</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Akses Dibuka</Label>
                                <Input type="time" className="h-11" value={settingsData.attendanceStart} onChange={(e) => setSettingsData({...settingsData, attendanceStart: e.target.value})} />
                                <p className="text-[10px] text-slate-400">Jam tombol "Absen Masuk" muncul.</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Batas Terlambat</Label>
                                <Input type="time" className="h-11" value={settingsData.attendanceLimit} onChange={(e) => setSettingsData({...settingsData, attendanceLimit: e.target.value})} />
                                <p className="text-[10px] text-slate-400">Lewat ini status jadi "Telat".</p>
                            </div>
                        </div>
                    </div>

                    {/* PRESENSI PULANG (AUTO) */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-l-4 border-orange-500 pl-2">2. Presensi Pulang</h4>
                        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 p-4 rounded-xl flex gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Otomatis Mengikuti Jam Selesai Operasional</p>
                                <p className="text-xs text-orange-600/80 dark:text-orange-400/70 leading-relaxed">
                                    Tombol "Absen Pulang" baru bisa diklik setelah <b>Jam Selesai</b> (16:00 untuk Sen-Kam, 14:30 untuk Jumat). Tidak perlu setting manual lagi.
                                </p>
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                    <Button onClick={handleSaveSettings} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Pengaturan Waktu
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* --- 3. TAB LOKASI KANTOR --- */}
        <TabsContent value="location" className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
            <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
              <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#99775C]" /> Geofencing Kantor
              </CardTitle>
              <CardDescription>Koordinat ini digunakan sebagai pusat validasi absensi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input value={settingsData.latitude} onChange={(e) => setSettingsData({...settingsData, latitude: e.target.value})} className="h-11 font-mono" placeholder="-7.xxxxx" />
                </div>
                <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input value={settingsData.longitude} onChange={(e) => setSettingsData({...settingsData, longitude: e.target.value})} className="h-11 font-mono" placeholder="110.xxxxx" />
                </div>
                <div className="space-y-2">
                    <Label>Radius (Meter)</Label>
                    <div className="relative">
                        <Input type="number" value={settingsData.radius} onChange={(e) => setSettingsData({...settingsData, radius: e.target.value})} className="h-11 pr-10" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">m</span>
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                <Button onClick={handleSaveSettings} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Lokasi
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 4. TAB KEAMANAN --- */}
        <TabsContent value="security" className="space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                <CardTitle className="text-slate-900 dark:text-[#EAE7DD]">Ganti Password</CardTitle>
                <CardDescription>Ubah password akun admin di sini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-lg pt-6">
                <div className="grid gap-2">
                    <Label>Password Baru</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#99775C]" />
                        <Input type={showNewPass ? "text" : "password"} value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="pl-9 pr-10 h-11" placeholder="******" />
                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Konfirmasi Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#99775C]" />
                        <Input type={showConfirmPass ? "text" : "password"} value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="pl-9 pr-10 h-11" placeholder="******" />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                    <Button onClick={handleSaveSecurity} disabled={loading} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

      </Tabs>
      
      <div className="text-xs text-slate-400 dark:text-gray-600 text-center pt-10 border-t border-slate-100 dark:border-[#292524] mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}