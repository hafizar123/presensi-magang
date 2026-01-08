import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>

      {/* Profil Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Admin</CardTitle>
          <CardDescription>Update informasi akun administrator.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nama Admin</Label>
            <Input defaultValue="Admin Disdikpora" />
          </div>
          <div className="grid gap-2">
            <Label>Email Dinas</Label>
            <Input defaultValue="admin@dinas.go.id" disabled className="bg-slate-100" />
          </div>
          <Button>Simpan Profil</Button>
        </CardContent>
      </Card>

      {/* Ganti Password */}
      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
          <CardDescription>Ganti password untuk menjaga keamanan akun.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Password Lama</Label>
            <Input type="password" />
          </div>
          <div className="grid gap-2">
            <Label>Password Baru</Label>
            <Input type="password" />
          </div>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Update Password</Button>
        </CardContent>
      </Card>
      
      <div className="text-xs text-slate-400 text-center pt-10">
        System Version 1.0.0 • Disdikpora DIY
      </div>
    </div>
  );
}