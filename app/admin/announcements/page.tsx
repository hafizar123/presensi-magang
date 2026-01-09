"use client";

import { useState } from "react";
import { Megaphone, Send, Loader2, Pin } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

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
        router.refresh(); 
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
    <div className="space-y-8 pb-10">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KOLOM KIRI: FORM INPUT */}
        <div className="space-y-6">
          <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Buat Pengumuman</h1>
              <p className="text-slate-500 dark:text-slate-400">Info ini bakal muncul di dashboard semua anak magang.</p>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Tulis Pesan Broadcast
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Judul Pengumuman</Label>
                          <Input 
                              placeholder="Contoh: Apel Pagi Dibatalkan" 
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Isi Pesan</Label>
                          <Textarea 
                              placeholder="Tulis detail pengumuman disini..." 
                              className="min-h-[150px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                              value={formData.content}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              required
                          />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" disabled={loading}>
                          {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                          Broadcast Sekarang
                      </Button>
                  </form>
              </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: PREVIEW HP */}
        <div className="space-y-6">
          <div>
              <h1 className="text-2xl font-bold opacity-0 hidden md:block">.</h1> 
              <p className="text-slate-500 dark:text-slate-400 text-left md:text-right">Preview tampilan di User</p>
          </div>

          {/* Simulasi Tampilan User (Frame HP) */}
          <div className="border-[6px] border-slate-900 dark:border-slate-800 rounded-[2.5rem] p-4 bg-slate-100 dark:bg-slate-950 max-w-sm mx-auto shadow-2xl relative transition-colors">
              {/* Poni HP */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-xl z-10"></div>
              
              <div className="mt-8 space-y-4">
                  {/* Kartu Pengumuman Preview */}
                  <div className="bg-blue-600 dark:bg-blue-800 p-4 rounded-xl text-white shadow-lg shadow-blue-500/20 transition-colors">
                      <div className="flex items-start gap-3">
                          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                              <Pin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                              <h3 className="font-bold text-sm leading-tight">
                                  {formData.title || "Judul Pengumuman"}
                              </h3>
                              <p className="text-xs text-blue-100 mt-2 leading-relaxed opacity-90">
                                  {formData.content || "Isi pengumuman bakal muncul disini kayak gini..."}
                              </p>
                              <p className="text-[10px] text-blue-200 mt-3 font-medium">Baru saja</p>
                          </div>
                      </div>
                  </div>

                  {/* Dummy Content Bawah */}
                  <div className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                      Konten Lain...
                  </div>
                  <div className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                      Konten Lain...
                  </div>
              </div>
          </div>
        </div>

      </div>

      <div className="text-xs text-slate-400 dark:text-slate-600 text-center pt-10 border-t border-slate-100 dark:border-slate-800/50 mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>

    </div>
  );
}