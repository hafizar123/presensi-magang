"use client";

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
import { User, Shield, MapPin, Save, Building, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    // HAPUS 'max-w-5xl mx-auto', GANTI JADI 'w-full'
    <div className="space-y-6 w-full pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pengaturan Sistem</h1>
        <p className="text-slate-500 dark:text-slate-400">Kelola preferensi aplikasi dan konfigurasi kantor.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {/* Tabs List juga dibikin responsive, kalo di HP numpuk, di PC jejer 3 */}
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
                        <Input defaultValue="Admin Disdikpora" className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Email Dinas</Label>
                    <Input defaultValue="admin@dinas.go.id" disabled className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">NIP / ID Pegawai</Label>
                    <Input defaultValue="19800101 200012 1 001" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Jabatan</Label>
                    <Input defaultValue="Kepala Sub Bagian Umum" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB 2: LOKASI & KANTOR */}
        <TabsContent value="office" className="mt-6 space-y-6">
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
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold">Info Penting:</p>
                    <p>Koordinat ini digunakan sebagai titik pusat validasi saat anak magang melakukan presensi via GPS.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Latitude (Garis Lintang)</Label>
                    <Input defaultValue="-7.8011945" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Longitude (Garis Bujur)</Label>
                    <Input defaultValue="110.364917" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Radius Toleransi (Meter)</Label>
                    <div className="flex items-center gap-2">
                        <Input defaultValue="100" type="number" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
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
                        <Input type="time" defaultValue="07:30" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">Jam Pulang</Label>
                        <Input type="time" defaultValue="16:00" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    </div>
                 </div>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                    <Save className="h-4 w-4 mr-2" /> Update Konfigurasi
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB 3: KEAMANAN */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Ganti Password</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Pastikan menggunakan password yang kuat minimal 8 karakter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Password Lama</Label>
                    <Input type="password" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Password Baru</Label>
                    <Input type="password" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</Label>
                    <Input type="password" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">
                    Update Password
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