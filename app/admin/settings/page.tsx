"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Shield, MapPin, Save, Building, AlertCircle, 
  CheckCircle2, Eye, EyeOff, Lock, Loader2, XCircle 
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

export default function SettingsPage() {
  const { data: session, update } = useSession(); // Pake update buat refresh session client-side
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Pop-up Sukses
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // State Pop-up Error
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- STATE TAB PROFIL ---
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    nip: "",
    jabatan: ""
  });

  // --- STATE TAB KANTOR (SETTINGS) ---
  const [officeData, setOfficeData] = useState({
    latitude: "",
    longitude: "",
    radius: "",
    startHour: "",
    endHour: ""
  });

  // --- STATE TAB KEAMANAN ---
  const [securityData, setSecurityData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // FETCH DATA SAAT LOAD
  useEffect(() => {
    // 1. Ambil Profile dari Database (Biar NIP & Jabatan ke-load)
    fetch("/api/admin/profile")
      .then(res => res.json())
      .then(data => {
        if(data) {
            setProfileData({
                name: data.name || "",
                email: data.email || "",
                nip: data.nip || "",
                jabatan: data.jabatan || ""
            });
        }
      })
      .catch(err => console.error("Gagal load profile", err));
    
    // 2. Ambil Settingan Kantor
    fetch("/api/admin/settings")
        .then(res => res.json())
        .then(data => setOfficeData(data))
        .catch(err => console.error("Gagal load settings", err));
  }, []);

  // --- HANDLER SIMPAN PROFIL (UPDATED) ---
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
            // Update session di client biar namanya berubah di header tanpa logout
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

  // --- HANDLER SIMPAN SETTINGS KANTOR ---
  const handleSaveOffice = async () => {
    // Validasi
    if (!officeData.latitude || !officeData.longitude || !officeData.radius || !officeData.startHour || !officeData.endHour) {
        setErrorMessage("Data belum lengkap! Mohon isi semua field.");
        setShowError(true);
        return;
    }
    if (isNaN(Number(officeData.latitude)) || isNaN(Number(officeData.longitude))) {
        setErrorMessage("Format koordinat salah! Harus berupa angka.");
        setShowError(true);
        return;
    }
    if (Number(officeData.radius) < 10) {
        setErrorMessage("Radius terlalu kecil! Minimal 10 meter.");
        setShowError(true);
        return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(officeData)
        });
        if(res.ok) {
            setSuccessMessage("Konfigurasi kantor disimpan!");
            setShowSuccess(true);
        } else {
            setErrorMessage("Gagal menyimpan.");
            setShowError(true);
        }
    } catch (error) {
        setErrorMessage("Terjadi kesalahan sistem.");
        setShowError(true);
    } finally {
        setLoading(false);
    }
  };

  // --- HANDLER GANTI PASSWORD ---
  const handleSaveSecurity = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword) {
        setErrorMessage("Form password belum lengkap!");
        setShowError(true);
        return;
    }
    if (securityData.newPassword.length < 6) {
        setErrorMessage("Password terlalu pendek! Minimal 6 karakter.");
        setShowError(true);
        return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
        setErrorMessage("Password dan konfirmasi tidak cocok!");
        setShowError(true);
        return;
    }

    setLoading(true);
    
    // Disini lo bisa tambah API call buat ganti password beneran (PUT ke /api/admin/users)
    // Untuk sekarang simulasi sukses dulu sesuai request sebelumnya
    setTimeout(() => {
        setLoading(false);
        setSuccessMessage("Password berhasil diubah!");
        setShowSuccess(true);
        setSecurityData({ newPassword: "", confirmPassword: "" });
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* --- POP-UP SUKSES --- */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Berhasil!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                    {successMessage}
                </p>
                <Button 
                    onClick={() => setShowSuccess(false)}
                    className="mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full rounded-xl"
                >
                    Tutup
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- POP-UP ERROR --- */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400 animate-shake" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Warning!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-[250px]">
                    {errorMessage}
                </p>
                <Button 
                    onClick={() => setShowError(false)}
                    className="mt-6 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 w-full rounded-xl"
                >
                    Coba Lagi
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pengaturan Sistem</h1>
        <p className="text-slate-500 dark:text-slate-400">Kelola preferensi aplikasi dan konfigurasi kantor.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-auto">
          <TabsTrigger value="profile" className="py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all dark:text-slate-400 dark:data-[state=active]:text-slate-100">
            <User className="h-4 w-4 mr-2" /> Profil Admin
          </TabsTrigger>
          <TabsTrigger value="office" className="py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all dark:text-slate-400 dark:data-[state=active]:text-slate-100">
            <Building className="h-4 w-4 mr-2" /> Lokasi & Kantor
          </TabsTrigger>
          <TabsTrigger value="security" className="py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all dark:text-slate-400 dark:data-[state=active]:text-slate-100">
            <Shield className="h-4 w-4 mr-2" /> Keamanan
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFIL */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Informasi Dasar</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Nama ini yang akan muncul di dashboard dan laporan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            value={profileData.name} 
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Email Dinas</Label>
                    <Input 
                        value={profileData.email} 
                        disabled 
                        className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">NIP / ID Pegawai</Label>
                    <Input 
                        value={profileData.nip} 
                        onChange={(e) => setProfileData({...profileData, nip: e.target.value})}
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="Contoh: 1980xxxx..." 
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Jabatan</Label>
                    <Input 
                        value={profileData.jabatan}
                        onChange={(e) => setProfileData({...profileData, jabatan: e.target.value})}
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="Contoh: Kepala Bagian..." 
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <Button onClick={handleSaveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Simpan Perubahan
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB 2 & 3: LOKASI & KEAMANAN (Masih sama, gak gua ubah) */}
        <TabsContent value="office" className="mt-6 space-y-6">
          {/* ... Isi Tab Office sama persis kayak kode sebelumnya ... */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Konfigurasi Geofencing
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Atur titik koordinat kantor dan radius toleransi absensi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-lg flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold">Info Penting:</p>
                    <p>Koordinat ini digunakan sebagai titik pusat validasi saat anak magang melakukan presensi via GPS.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Latitude (Garis Lintang)</Label>
                    <Input value={officeData.latitude} onChange={(e) => setOfficeData({...officeData, latitude: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Longitude (Garis Bujur)</Label>
                    <Input value={officeData.longitude} onChange={(e) => setOfficeData({...officeData, longitude: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Radius Toleransi (Meter)</Label>
                    <div className="flex items-center gap-2">
                        <Input type="number" value={officeData.radius} onChange={(e) => setOfficeData({...officeData, radius: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">Meter</span>
                    </div>
                </div>
              </div>
              <Separator className="bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-4">
                 <h3 className="font-medium text-slate-900 dark:text-slate-100">Jam Kerja Default</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Jam Masuk</Label>
                        <Input type="time" value={officeData.startHour} onChange={(e) => setOfficeData({...officeData, startHour: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Jam Pulang</Label>
                        <Input type="time" value={officeData.endHour} onChange={(e) => setOfficeData({...officeData, endHour: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    </div>
                 </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <Button onClick={handleSaveOffice} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Konfigurasi
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          {/* ... Isi Tab Security sama persis ... */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Ganti Password</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Ubah password akun admin anda di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300">Password Baru</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type={showNewPass ? "text" : "password"} value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="pl-9 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="Masukkan Password Baru" />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type={showConfirmPass ? "text" : "password"} value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="pl-9 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="Masukkan Konfirmasi Password Baru" />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <Button onClick={handleSaveSecurity} disabled={loading} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
      <div className="text-xs text-slate-400 dark:text-slate-600 text-center pt-10 border-t border-slate-100 dark:border-slate-800/50 mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}