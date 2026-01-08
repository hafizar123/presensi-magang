"use client";

import { useState, useEffect } from "react";
import { Megaphone, Trash2, Send, Loader2, Pin } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function AnnouncementPage() {
  const router = useRouter();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ title: "", content: "" });

  // Fetch Data (Kita pake server action simple di useEffect)
  const fetchAnnouncements = async () => {
    // Note: Idealnya ini dipisah jadi API GET, tapi buat cepet kita mock dulu atau panggil prisma di server component.
    // Biar gampang & interaktif (hapus langsung ilang), kita fetch ulang page aja.
    router.refresh(); 
  };
  
  // Karena ini Client Component, kita gabisa panggil Prisma langsung.
  // Buat simplifikasi tutorial, kita anggep list-nya di-pass dari Server Component sebenernya lebih baik.
  // TAPI biar ga ribet bolak-balik file, kita tampilin form-nya dulu aja.
  // Nanti list-nya bakal muncul kalo kita refresh page.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: "", content: "" });
        alert("Pengumuman Terkirim!");
        router.refresh(); // Refresh biar muncul di list (kalo lo implement list server side)
      } else {
        alert("Gagal kirim");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* KOLOM KIRI: FORM INPUT */}
      <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Buat Pengumuman</h1>
            <p className="text-slate-500">Info ini bakal muncul di dashboard semua anak magang.</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                    Tulis Pesan Broadcast
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Judul Pengumuman</Label>
                        <Input 
                            placeholder="Contoh: Apel Pagi Dibatalkan" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Isi Pesan</Label>
                        <Textarea 
                            placeholder="Tulis detail pengumuman disini..." 
                            className="min-h-[150px]"
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                        Broadcast Sekarang
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>

      {/* KOLOM KANAN: PREVIEW (Atau List History) */}
      <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 opacity-0">.</h1> {/* Spacer doang */}
            <p className="text-slate-500 text-right">Preview tampilan di User</p>
        </div>

        {/* Simulasi Tampilan User */}
        <div className="border-4 border-slate-900 rounded-[2rem] p-4 bg-slate-100 max-w-sm mx-auto shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl"></div>
            
            <div className="mt-8 space-y-4">
                <div className="bg-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-500/20">
                    <div className="flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Pin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">
                                {formData.title || "Judul Pengumuman"}
                            </h3>
                            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                                {formData.content || "Isi pengumuman bakal muncul disini kayak gini..."}
                            </p>
                            <p className="text-[10px] text-blue-200 mt-2">Baru saja</p>
                        </div>
                    </div>
                </div>

                <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-300 text-xs">
                    Konten Lain...
                </div>
            </div>
        </div>

      </div>

    </div>
  );
}