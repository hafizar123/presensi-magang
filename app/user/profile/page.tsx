"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({ ...prev, name: session.user.name || "" }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          password: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      if (!res.ok) throw new Error("Gagal update profil");
      
      await update({ ...session, user: { ...session?.user, name: formData.name } });
      alert("Berhasil update profil! 🎉");
      router.refresh();
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" })); // Reset password field
    } catch (error) {
      alert("Ada error, cek password lama lo bener ga?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
            </div>
            
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Ganti Password (Opsional)</p>
                <div className="space-y-2">
                    <Label>Password Saat Ini</Label>
                    <Input 
                        type="password" 
                        placeholder="Wajib isi kalo mau ganti password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <Input 
                        type="password" 
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    />
                </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}