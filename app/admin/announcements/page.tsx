"use client";

import { useState, useEffect } from "react";
import { 
  Megaphone, Send, Loader2, Pin, CheckCircle2, 
  Trash2, Pencil, Eye, EyeOff, AlertTriangle, Calendar, RefreshCcw 
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Announcement = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
};

export default function AnnouncementPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  
  // State Mode Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // State Pop-up Sukses
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // FETCH DATA
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setList(data);
    } catch (error) {
      console.error("Gagal load data");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // HANDLE SUBMIT (CREATE / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/admin/announcements";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing 
        ? { id: editId, ...formData } 
        : formData;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccessMsg(isEditing ? "Pengumuman berhasil diupdate!" : "Broadcast berhasil terkirim!");
        setShowSuccess(true);
        fetchAnnouncements();
        resetForm();
      } else {
        alert("Gagal proses data");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE DELETE (UPDATED: ADA POPUP SUKSES)
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccessMsg("Pengumuman berhasil dihapus!"); // <--- Set Pesan
        setShowSuccess(true); // <--- Munculin Centang Ijo
        fetchAnnouncements();
      }
    } catch (error) {
      alert("Gagal hapus");
    }
  };

  // HANDLE TOGGLE VISIBILITY (HIDE/SHOW)
  const handleToggleStatus = async (item: Announcement) => {
    try {
        const res = await fetch("/api/admin/announcements", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id: item.id, 
                isActive: !item.isActive 
            }),
        });
        if (res.ok) {
            fetchAnnouncements();
        }
    } catch (error) {
        console.error("Gagal ganti status");
    }
  };

  // PREPARE EDIT
  const handleEditClick = (item: Announcement) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormData({ title: item.title, content: item.content });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* POP-UP SUKSES (Create, Update, Delete pake ini semua) */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Berhasil!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-[250px]">
                    {successMsg}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* KOLOM KIRI (2/5): FORM INPUT */}
        <div className="lg:col-span-2 space-y-6">
          <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kelola Pengumuman</h1>
              <p className="text-slate-500 dark:text-slate-400">Buat info baru atau edit yang lama.</p>
          </div>

          <Card className={`border-slate-200 dark:border-slate-800 shadow-sm transition-colors ${isEditing ? "border-yellow-400 dark:border-yellow-600 ring-1 ring-yellow-400/20" : "bg-white dark:bg-slate-900"}`}>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      {isEditing ? (
                          <>
                            <Pencil className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            Edit Pengumuman
                          </>
                      ) : (
                          <>
                            <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Buat Pengumuman Baru
                          </>
                      )}
                  </CardTitle>
                  {isEditing && (
                      <CardDescription className="text-yellow-600 dark:text-yellow-400">
                          Anda sedang mengedit data.
                      </CardDescription>
                  )}
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Judul</Label>
                          <Input 
                              placeholder="Contoh: Libur Nasional" 
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300">Isi Konten</Label>
                          <Textarea 
                              placeholder="Tulis detailnya disini..." 
                              className="min-h-[150px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                              value={formData.content}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              required
                          />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        {isEditing && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={resetForm}
                            >
                                Batal
                            </Button>
                        )}
                        <Button 
                            type="submit" 
                            className={`flex-1 text-white shadow-lg transition-all ${isEditing ? "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}`} 
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : isEditing ? <RefreshCcw className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                            {isEditing ? "Update Data" : "Broadcast"}
                        </Button>
                      </div>
                  </form>
              </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN (3/5): LIST HISTORY */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 hidden lg:block">Riwayat Broadcast</h1>
                <p className="text-slate-500 dark:text-slate-400 hidden lg:block">Daftar pengumuman yang pernah dibuat.</p>
              </div>
              <Badge variant="outline" className="h-fit">
                Total: {list.length}
              </Badge>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {list.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-slate-400">Belum ada pengumuman.</p>
                </div>
            ) : (
                list.map((item) => (
                    <Card key={item.id} className={`group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md ${!item.isActive ? "opacity-60 bg-slate-50 dark:bg-slate-950" : ""}`}>
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        {item.isActive ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-none px-2 py-0.5 text-[10px]">
                                                TAYANG
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                                                DISEMBUNYIKAN
                                            </Badge>
                                        )}
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(item.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {item.content}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                        onClick={() => handleToggleStatus(item)}
                                        title={item.isActive ? "Sembunyikan" : "Tampilkan"}
                                    >
                                        {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                                        onClick={() => handleEditClick(item)}
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    {/* DELETE BUTTON WITH CONFIRMATION */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                                            <AlertDialogHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                                                    </div>
                                                    <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Hapus Pengumuman?</AlertDialogTitle>
                                                </div>
                                                <AlertDialogDescription className="pl-[3.25rem] text-slate-500 dark:text-slate-400">
                                                    Item ini akan dihapus permanen dan tidak bisa dikembalikan.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-2">
                                                <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 border-0">Batal</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Ya, Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}