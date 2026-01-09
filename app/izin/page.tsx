"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function IzinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State data form
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Pake FormData buat kirim File
    const formData = new FormData();
    formData.append("date", date);
    formData.append("reason", reason);
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/izin", {
        method: "POST",
        body: formData, // Kirim formData langsung (jangan di JSON.stringify)
      });

      if (res.ok) {
        alert("Sip! Surat sakit/izin berhasil diupload.");
        router.push("/");
      } else {
        alert("Gagal kirim izin bro.");
      }
    } catch (error) {
      alert("Error server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-full bg-white">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengajuan Izin/Sakit</h1>
          <p className="text-xs text-slate-500">Upload bukti surat jika ada</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Tanggal Izin */}
                <div className="space-y-2">
                    <Label>Tanggal Izin</Label>
                    <Input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-white"
                    />
                </div>

                {/* Alasan */}
                <div className="space-y-2">
                    <Label>Alasan / Keterangan</Label>
                    <Textarea 
                        placeholder="Contoh: Sakit demam tinggi, tidak bisa masuk kantor..." 
                        className="min-h-[100px] bg-white"
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                {/* Upload File */}
                <div className="space-y-2">
                    <Label>Upload Surat Dokter / Bukti (Opsional)</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            accept="image/*,.pdf"
                        />
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                            <UploadCloud className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {file ? file.name : "Klik buat upload file"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Format: JPG, PNG, atau PDF (Max 2MB)
                        </p>
                    </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                    Kirim Pengajuan
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}