"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Shield, MapPin, Save, Building, AlertCircle, 
  CheckCircle2, Eye, EyeOff, Lock, Loader2, XCircle, Clock 
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
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    nip: "",
    jabatan: ""
  });

  // Tambahin endHourFriday di state
  const [officeData, setOfficeData] = useState({
    latitude: "",
    longitude: "",
    radius: "",
    startHour: "",
    endHour: "",
    endHourFriday: "" 
  });

  const [securityData, setSecurityData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
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
    
    fetch("/api/admin/settings")
        .then(res => res.json())
        .then(data => setOfficeData(data))
        .catch(err => console.error("Gagal load settings", err));
  }, []);

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

  const handleSaveOffice = async () => {
    // Validasi input
    if (!officeData.latitude || !officeData.longitude || !officeData.radius || 
        !officeData.startHour || !officeData.endHour || !officeData.endHourFriday) {
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
    setTimeout(() => {
        setLoading(false);
        setSuccessMessage("Password berhasil diubah!");
        setShowSuccess(true);
        setSecurityData({ newPassword: "", confirmPassword: "" });
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* DIALOG SUCCESS & ERROR (SAMA KAYA SEBELUMNYA) */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Berhasil!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                    {successMessage}
                </p>
                <Button 
                    onClick={() => setShowSuccess(false)}
                    className="mt-6 bg-[#99775C] hover:bg-[#86664d] text-white w-full rounded-xl"
                >
                    Tutup
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-5">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#EAE7DD]">Warning!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-[250px]">
                    {errorMessage}
                </p>
                <Button 
                    onClick={() => setShowError(false)}
                    className="mt-6 bg-red-600 hover:bg-red-700 text-white w-full rounded-xl"
                >
                    Coba Lagi
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Pengaturan Sistem</h1>
        <p className="text-slate-500 dark:text-gray-400">Kelola preferensi aplikasi dan konfigurasi kantor.</p>
      </div>

      <Tabs defaultValue="office" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-slate-100 dark:bg-[#1c1917] p-1 rounded-xl h-auto border dark:border-[#292524]">
          <TabsTrigger value="profile" className="py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm rounded-lg transition-all dark:text-gray-400 dark:data-[state=active]:text-[#EAE7DD]">
            <User className="h-4 w-4 mr-2" /> Profil Admin
          </TabsTrigger>
          <TabsTrigger value="office" className="py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm rounded-lg transition-all dark:text-gray-400 dark:data-[state=active]:text-[#EAE7DD]">
            <Building className="h-4 w-4 mr-2" /> Lokasi & Kantor
          </TabsTrigger>
          <TabsTrigger value="security" className="py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-[#292524] data-[state=active]:shadow-sm rounded-lg transition-all dark:text-gray-400 dark:data-[state=active]:text-[#EAE7DD]">
            <Shield className="h-4 w-4 mr-2" /> Keamanan
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB (Gak Berubah) */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden">
             {/* ... (Konten Profile sama kayak sebelumnya) ... */}
             <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
              <CardTitle className="text-slate-900 dark:text-[#EAE7DD]">Informasi Dasar</CardTitle>
              <CardDescription className="text-slate-500 dark:text-gray-400">
                Nama ini yang akan muncul di dashboard dan laporan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">Nama Lengkap</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-[#99775C]" />
                        <Input 
                            value={profileData.name} 
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="pl-9 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">Email Dinas</Label>
                    <Input 
                        value={profileData.email} 
                        disabled 
                        className="bg-slate-100 dark:bg-[#292524]/50 border-slate-200 dark:border-none text-slate-500 dark:text-gray-500 cursor-not-allowed" 
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">NIP / ID Pegawai</Label>
                    <Input 
                        value={profileData.nip} 
                        onChange={(e) => setProfileData({...profileData, nip: e.target.value})}
                        className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]"
                        placeholder="Contoh: 1980xxxx..." 
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">Jabatan</Label>
                    <Input 
                        value={profileData.jabatan}
                        onChange={(e) => setProfileData({...profileData, jabatan: e.target.value})}
                        className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]"
                        placeholder="Contoh: Kepala Bagian..." 
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                <Button onClick={handleSaveProfile} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-lg shadow-black/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Simpan Perubahan
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* OFFICE TAB (UPDATED) */}
        <TabsContent value="office" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
              <CardTitle className="text-slate-900 dark:text-[#EAE7DD] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#99775C]" />
                Konfigurasi Geofencing
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-gray-400">
                Atur titik koordinat kantor dan radius toleransi absensi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="bg-[#99775C]/10 dark:bg-[#99775C]/5 border border-[#99775C]/20 p-4 rounded-lg flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-[#99775C] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-800 dark:text-gray-300">
                    <p className="font-semibold text-[#99775C]">Info Penting:</p>
                    <p>Koordinat ini digunakan sebagai titik pusat validasi saat anak magang melakukan presensi via GPS.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">Latitude (Garis Lintang)</Label>
                    <Input value={officeData.latitude} onChange={(e) => setOfficeData({...officeData, latitude: e.target.value})} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD] font-mono" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">Longitude (Garis Bujur)</Label>
                    <Input value={officeData.longitude} onChange={(e) => setOfficeData({...officeData, longitude: e.target.value})} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD] font-mono" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300">Radius Toleransi (Meter)</Label>
                    <div className="flex items-center gap-2">
                        <Input type="number" value={officeData.radius} onChange={(e) => setOfficeData({...officeData, radius: e.target.value})} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]" />
                        <span className="text-sm text-slate-500 dark:text-gray-500">Meter</span>
                    </div>
                </div>
              </div>
              <Separator className="bg-slate-100 dark:bg-[#292524]" />
              
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-slate-900 dark:text-[#EAE7DD] mb-2">
                    <Clock className="h-5 w-5 text-[#99775C]" />
                    <h3 className="font-medium">Jadwal Operasional</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Jam Masuk (Semua Hari)</Label>
                        <Input type="time" value={officeData.startHour} onChange={(e) => setOfficeData({...officeData, startHour: e.target.value})} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Jam Pulang (Senin - Kamis)</Label>
                        <Input type="time" value={officeData.endHour} onChange={(e) => setOfficeData({...officeData, endHour: e.target.value})} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-gray-300">Jam Pulang (Jumat)</Label>
                        <Input type="time" value={officeData.endHourFriday} onChange={(e) => setOfficeData({...officeData, endHourFriday: e.target.value})} className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-slate-900 dark:text-[#EAE7DD]" />
                    </div>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-gray-500 italic">
                    *Sabtu dan Minggu presensi otomatis dinonaktifkan sistem.
                 </p>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                <Button onClick={handleSaveOffice} disabled={loading} className="bg-[#99775C] hover:bg-[#86664d] text-white shadow-lg shadow-black/20">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Konfigurasi
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SECURITY TAB (Gak Berubah) */}
        <TabsContent value="security" className="mt-6 space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-[#292524]">
                <CardTitle className="text-slate-900 dark:text-[#EAE7DD]">Ganti Password</CardTitle>
                <CardDescription className="text-slate-500 dark:text-gray-400">
                    Ubah password akun admin anda di sini.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-lg pt-6">
                <div className="grid gap-2">
                    <Label className="text-slate-700 dark:text-gray-300">Password Baru</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#99775C]" />
                        <Input type={showNewPass ? "text" : "password"} value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="pl-9 pr-10 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]" placeholder="Masukkan Password Baru" />
                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
                            {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label className="text-slate-700 dark:text-gray-300">Konfirmasi Password Baru</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#99775C]" />
                        <Input type={showConfirmPass ? "text" : "password"} value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="pl-9 pr-10 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-none text-slate-900 dark:text-[#EAE7DD]" placeholder="Masukkan Konfirmasi Password Baru" />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
                            {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-[#292524]/30 border-t border-slate-100 dark:border-[#292524] px-6 py-4">
                    <Button onClick={handleSaveSecurity} disabled={loading} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20">
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