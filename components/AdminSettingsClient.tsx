"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Shield, MapPin, Save, AlertCircle, 
  CheckCircle2, Eye, EyeOff, Lock, Loader2, XCircle, Clock, CalendarDays, MousePointerClick,
  FileText
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const DIVISI_OPTIONS = [
    "Sub Bagian Keuangan",
    "Sub Bagian Kepegawaian",
    "Sub Bagian Umum",
    "Bidang Perencanaan dan Pengembangan Mutu Pendidikan, Pemuda, dan Olahraga",
    "Bidang Pembinaan Sekolah Menengah Atas",
    "Bidang Pembinaan Sekolah Menengah Kejuruan",
    "Bidang Pendidikan Khusus dan Layanan Khusus",
];

interface AdminSettingsClientProps {
  user: any;
}

export default function AdminSettingsClient({ user }: AdminSettingsClientProps) {
  const { update } = useSession(); 
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Data Profil
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    nomorInduk: user.nomorInduk || "",       
    divisi: user.divisi || "" 
  });

  // 2. Data Pengaturan (Ada kepalaDinasName)
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
    kepalaDinasName: "", 
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
    fetch("/api/admin/profile")
      .then(res => res.json())
      .then(data => {
        if(data) {
            setProfileData(prev => ({
                ...prev,
                name: data.name || prev.name,
                email: data.email || prev.email,
                nomorInduk: data.nomorInduk || "", 
                divisi: data.divisi || ""          
            }));
        }
      })
      .catch(err => console.error("Gagal load profile", err));
    
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
                nomorInduk: profileData.nomorInduk, 
                divisi: profileData.divisi          
            })
        });

        if (res.ok) {
            setSuccessMessage("Profil administrator berhasil diperbarui.");
            setShowSuccess(true);
            router.refresh();
        } else {
            setErrorMessage("Gagal menyimpan profil. Silakan coba lagi.");
            setShowError(true);
        }
    } catch (error) {
        setErrorMessage("Terjadi kesalahan pada server.");
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
            setSuccessMessage("Pengaturan sistem dan master data berhasil disimpan.");
            setShowSuccess(true);
        } else {
            setErrorMessage("Gagal menyimpan pengaturan sistem.");
            setShowError(true);
        }
    } catch (error) {
        setErrorMessage("Terjadi kesalahan pada server.");
        setShowError(true);
    } finally {
        setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword) {
        setErrorMessage("Formulasi kata sandi belum lengkap.");
        setShowError(true);
        return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
        setErrorMessage("Konfirmasi kata sandi tidak sesuai.");
        setShowError(true);
        return;
    }
    if (securityData.newPassword.length < 6) {
        setErrorMessage("Kata sandi harus terdiri dari minimal 6 karakter.");
        setShowError(true);
        return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/admin/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword: securityData.newPassword })
        });

        if (res.ok) {
            setSuccessMessage("Kata sandi berhasil diubah.");
            setShowSuccess(true);
            setSecurityData({ newPassword: "", confirmPassword: "" });
        } else {
            setErrorMessage("Gagal mengubah kata sandi.");
            setShowError(true);
        }
    } catch (e) {
        setErrorMessage("Terjadi kesalahan pada server.");
        setShowError(true);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* DIALOG SUCCESS */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 animate-in zoom-in-0 duration-300">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Berhasil</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm">{successMessage}</p>
                <Button onClick={() => setShowSuccess(false)} className="mt-6 bg-[#99775C] hover:bg-[#86664d] text-white w-full rounded-xl shadow-md transition-all active:scale-95">
                    Tutup
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG ERROR */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5 animate-in zoom-in-0 duration-300">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Peringatan</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm">{errorMessage}</p>
                <Button onClick={() => setShowError(false)} className="mt-6 bg-red-600 hover:bg-red-700 text-white w-full rounded-xl shadow-md transition-all active:scale-95">
                    Coba Lagi
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Pengaturan Sistem</h1>
        <p className="text-slate-500 dark:text-gray-400">Kelola profil administrator, jam operasional, geofencing, dan master data.</p>
      </div>

      {/* TABS - Default ke Profil */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-100 dark:bg-[#1c1917] p-1 rounded-xl h-auto border dark:border-[#292524] mb-6">
          <TabsTrigger value="profile" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">
            <User className="h-4 w-4 mr-2" /> Profil Admin
          </TabsTrigger>
          <TabsTrigger value="surat" className="py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm data-[state=active]:text-[#99775C] transition-all">
            <FileText className="h-4 w-4 mr-2" /> Data Surat
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
              <CardDescription>Perbarui identitas yang digunakan dalam sistem manajemen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="pl-10 h-11 border-slate-200 focus-visible:ring-[#99775C]" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Alamat Email</Label>
                    <Input value={profileData.email} disabled className="h-11 bg-slate-100 dark:bg-black/20 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">NIP / Nomor Pegawai</Label>
                    <Input value={profileData.nomorInduk} onChange={(e) => setProfileData({...profileData, nomorInduk: e.target.value})} className="h-11 border-slate-200 focus-visible:ring-[#99775C]" placeholder="Masukkan Nomor Induk" />
                </div>
                
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Divisi / Penempatan</Label>
                    <Select value={profileData.divisi} onValueChange={(val) => setProfileData({...profileData, divisi: val})}>
                        <SelectTrigger className="h-11 bg-white dark:bg-[#1c1917] border-slate-200 focus:ring-[#99775C]">
                            <SelectValue placeholder="Pilih Divisi" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1c1917] border-slate-200">
                            {DIVISI_OPTIONS.map((divisi) => (
                                <SelectItem key={divisi} value={divisi}>{divisi}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md active:scale-95 transition-all">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Profil
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 2. TAB DATA SURAT --- */}
        <TabsContent value="surat" className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
            <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
              <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#99775C]" /> Master Data Instansi
              </CardTitle>
              <CardDescription>Atur data pejabat yang akan digunakan sebagai penanda tangan otomatis di Surat Keterangan Magang.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2 max-w-xl">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Nama Kepala Dinas</Label>
                  <Input 
                      value={settingsData.kepalaDinasName || ""} 
                      onChange={(e) => setSettingsData({...settingsData, kepalaDinasName: e.target.value})} 
                      className="h-11 focus-visible:ring-[#99775C]" 
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Nama ini akan tercetak otomatis pada cetakan Surat Keterangan Selesai Magang PDF.</p>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4 flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md active:scale-95 transition-all">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Master Data
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 3. TAB WAKTU & PRESENSI --- */}
        <TabsContent value="time" className="space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                    <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#99775C]" /> Waktu Operasional Kantor
                    </CardTitle>
                    <CardDescription>Atur jam kerja institusi untuk hari biasa dan khusus hari Jumat.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="h-4 w-4 text-blue-500" /> Senin - Kamis
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Mulai</Label>
                                <Input type="time" className="h-11 focus-visible:ring-[#99775C]" value={settingsData.opStartMonThu} onChange={(e) => setSettingsData({...settingsData, opStartMonThu: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Selesai</Label>
                                <Input type="time" className="h-11 focus-visible:ring-[#99775C]" value={settingsData.opEndMonThu} onChange={(e) => setSettingsData({...settingsData, opEndMonThu: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-[#292524]" />

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="h-4 w-4 text-green-500" /> Khusus Jumat
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Mulai</Label>
                                <Input type="time" className="h-11 focus-visible:ring-[#99775C]" value={settingsData.opStartFri} onChange={(e) => setSettingsData({...settingsData, opStartFri: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jam Selesai</Label>
                                <Input type="time" className="h-11 focus-visible:ring-[#99775C]" value={settingsData.opEndFri} onChange={(e) => setSettingsData({...settingsData, opEndFri: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                    <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                        <MousePointerClick className="h-5 w-5 text-[#99775C]" /> Ketentuan Presensi
                    </CardTitle>
                    <CardDescription>Atur jendela waktu ketersediaan absensi sistem.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-l-4 border-[#99775C] pl-2">1. Presensi Masuk</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Akses Dibuka</Label>
                                <Input type="time" className="h-11 focus-visible:ring-[#99775C]" value={settingsData.attendanceStart} onChange={(e) => setSettingsData({...settingsData, attendanceStart: e.target.value})} />
                                <p className="text-[10px] text-slate-400 mt-1">Waktu tombol absensi muncul.</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Batas Keterlambatan</Label>
                                <Input type="time" className="h-11 focus-visible:ring-[#99775C]" value={settingsData.attendanceLimit} onChange={(e) => setSettingsData({...settingsData, attendanceLimit: e.target.value})} />
                                <p className="text-[10px] text-slate-400 mt-1">Lewat dari waktu ini akan tercatat Telat.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-l-4 border-orange-500 pl-2">2. Presensi Pulang</h4>
                        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 p-4 rounded-xl flex gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Terintegrasi dengan Jam Selesai Operasional</p>
                                <p className="text-xs text-orange-600/80 dark:text-orange-400/70 leading-relaxed">
                                    Tombol "Absen Pulang" baru akan tersedia setelah melewati batas <b>Jam Selesai</b> yang ditetapkan di atas.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md active:scale-95 transition-all">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Pengaturan Waktu
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        {/* --- 4. TAB LOKASI KANTOR --- */}
        <TabsContent value="location" className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
            <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
              <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#99775C]" /> Geofencing Kantor
              </CardTitle>
              <CardDescription>Pusat koordinat dan radius validasi lokasi kehadiran.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Latitude</Label>
                    <Input value={settingsData.latitude} onChange={(e) => setSettingsData({...settingsData, latitude: e.target.value})} className="h-11 font-mono focus-visible:ring-[#99775C]" placeholder="-7.xxxxx" />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Longitude</Label>
                    <Input value={settingsData.longitude} onChange={(e) => setSettingsData({...settingsData, longitude: e.target.value})} className="h-11 font-mono focus-visible:ring-[#99775C]" placeholder="110.xxxxx" />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Radius Toleransi (Meter)</Label>
                    <div className="relative">
                        <Input type="number" value={settingsData.radius} onChange={(e) => setSettingsData({...settingsData, radius: e.target.value})} className="h-11 pr-10 focus-visible:ring-[#99775C]" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">m</span>
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4 flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-md active:scale-95 transition-all">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan Lokasi
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- 5. TAB KEAMANAN --- */}
        <TabsContent value="security" className="space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                <CardTitle className="text-slate-900 dark:text-[#EAE7DD]">Ganti Kata Sandi</CardTitle>
                <CardDescription>Pembaruan kata sandi secara berkala untuk menjaga keamanan akun.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-lg pt-6">
                <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Kata Sandi Baru</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input type={showNewPass ? "text" : "password"} value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="pl-10 pr-10 h-11 focus-visible:ring-[#99775C]" placeholder="******" />
                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C]">
                            {showNewPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input type={showConfirmPass ? "text" : "password"} value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="pl-10 pr-10 h-11 focus-visible:ring-[#99775C]" placeholder="******" />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C]">
                            {showConfirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4 flex justify-start">
                    <Button onClick={handleSaveSecurity} disabled={loading} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Perbarui Kata Sandi"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}