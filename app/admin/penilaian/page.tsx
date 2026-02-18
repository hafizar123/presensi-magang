"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, Star, UserCheck, Search, 
  ChevronRight, ClipboardList, Award, TrendingUp,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// DEFINISI TIPE BIAR ENGGAK ERROR TS (THE "ANTI-NEVER" SHIELD)
interface Evaluation {
  id: string;
  pekerjaan: string;
  status: string;
  rataRata?: number;
  nilaiDisiplin?: number;
  nilaiTanggungJawab?: number;
  nilaiInisiatif?: number;
  nilaiKerjasama?: number;
  nilaiKualitas?: number;
  user: {
    name: string;
    email: string;
    internProfile?: {
      university?: string;
    }
  }
}

export default function AdminPenilaianPage() {
  // PAKAI <Evaluation[]> BIAR TS GAK NGAMUK
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nilai, setNilai] = useState({ n1: 0, n2: 0, n3: 0, n4: 0, n5: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEvals = () => {
    setLoading(true);
    fetch("/api/admin/final-evaluation")
      .then(res => res.json())
      .then(data => {
        setEvals(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Gagal ambil data bre"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvals(); }, []);

  const handleGrade = async () => {
    if (Object.values(nilai).some(v => v < 0 || v > 100)) {
      return toast.error("Nilai harus 0-100 ya bre!");
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/final-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEval?.id, ...nilai })
      });
      if (res.ok) {
        toast.success("Penilaian Berhasil!", { description: "User sudah bisa download surat." });
        fetchEvals();
        setIsDialogOpen(false);
      }
    } catch (err) {
      toast.error("Gagal simpan nilai");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvals = evals.filter((ev) => 
    ev.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Award className="h-8 w-8 text-[#99775C]" />
            Penilaian Akhir
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 uppercase text-[10px] font-bold tracking-widest italic">Management / Evaluation</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Cari nama peserta..." 
                    className="pl-10 w-[250px] rounded-2xl border-slate-200 bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={fetchEvals} variant="outline" size="icon" className="rounded-2xl shadow-sm">
                <TrendingUp className="h-4 w-4 text-[#99775C]" />
            </Button>
        </div>
      </div>

      {/* STATS MINI - KALCER VIBE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Total Masuk", val: evals.length, bg: "bg-blue-100", txt: "text-blue-600" },
            { label: "Belum Dinilai", val: evals.filter((e) => e.status === "PENDING").length, bg: "bg-orange-100", txt: "text-orange-600" },
            { label: "Sudah Dinilai", val: evals.filter((e) => e.status === "GRADED").length, bg: "bg-emerald-100", txt: "text-emerald-600" },
        ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-[#1c1917] p-6 rounded-[2rem] border border-slate-100 dark:border-[#292524] flex items-center gap-4 transition-all hover:shadow-lg">
                <div className={`h-12 w-12 ${s.bg} ${s.txt} rounded-2xl flex items-center justify-center font-black`}>{s.val}</div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{s.label}</p>
                    <p className="text-lg font-black dark:text-white leading-none tracking-tight">Peserta Magang</p>
                </div>
            </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-[#1c1917] rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-[#292524] overflow-hidden">
        {loading ? (
            <div className="p-20 text-center text-[#99775C]"><Loader2 className="animate-spin mx-auto h-10 w-10" /></div>
        ) : (
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-black/20">
                    <TableRow className="border-b border-slate-100">
                        <TableHead className="py-6 px-8 font-black text-slate-400 uppercase text-[11px]">Nama Peserta</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[11px]">Instansi</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[11px]">Status</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[11px]">Rata-rata</TableHead>
                        <TableHead className="text-right px-8 font-black text-slate-400 uppercase text-[11px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEvals.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400 italic">Zonk bre, ga ada data...</TableCell></TableRow>
                    ) : (
                        filteredEvals.map((ev) => (
                            <TableRow key={ev.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-5 px-8">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-[#99775C]/10">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${ev.user?.name}&background=random`} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white leading-none mb-1">{ev.user?.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{ev.user?.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-gray-400 font-bold text-sm">
                                    {ev.user?.internProfile?.university || "Umum"}
                                </TableCell>
                                <TableCell>
                                    <Badge className={`rounded-full px-3 py-1 border-none font-black text-[9px] uppercase tracking-wider ${ev.status === "GRADED" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700 animate-pulse"}`}>
                                        {ev.status === "GRADED" ? "Diterbitkan" : "Menunggu"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {ev.rataRata ? (
                                        <div className="flex items-center gap-1.5 font-black text-lg text-[#99775C]">
                                            <Star className="h-4 w-4 fill-current" /> {ev.rataRata.toFixed(1)}
                                        </div>
                                    ) : <span className="text-slate-300 font-bold">-</span>}
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Dialog open={isDialogOpen && selectedEval?.id === ev.id} onOpenChange={(open) => {
                                      setIsDialogOpen(open);
                                      if (open) {
                                          setSelectedEval(ev);
                                          if (ev.status === "GRADED") {
                                              setNilai({ 
                                                n1: ev.nilaiDisiplin || 0, 
                                                n2: ev.nilaiTanggungJawab || 0, 
                                                n3: ev.nilaiInisiatif || 0, 
                                                n4: ev.nilaiKerjasama || 0, 
                                                n5: ev.nilaiKualitas || 0 
                                              });
                                          } else {
                                              setNilai({ n1: 0, n2: 0, n3: 0, n4: 0, n5: 0 });
                                          }
                                      }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button 
                                                size="sm" 
                                                variant={ev.status === "GRADED" ? "outline" : "default"}
                                                className={`rounded-xl h-10 px-5 font-black group transition-all ${ev.status !== "GRADED" ? "bg-[#99775C] hover:bg-[#7a5e48]" : ""}`}
                                            >
                                                {ev.status === "GRADED" ? "Review" : "Beri Nilai"}
                                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </DialogTrigger>
                                        
                                        <DialogContent className="max-w-2xl rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#1c1917]">
                                            <div className="bg-gradient-to-r from-[#99775C] to-[#8a6b52] p-8 text-white">
                                                <DialogTitle className="text-2xl font-black tracking-tight">Evaluasi Peserta</DialogTitle>
                                                <DialogDescription className="text-white/80 mt-1 font-medium italic">
                                                    Penilaian Akhir: {ev.user?.name}
                                                </DialogDescription>
                                            </div>
                                            
                                            <div className="p-8 space-y-6">
                                                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-dashed border-slate-200 space-y-2">
                                                    <h4 className="text-[10px] font-black uppercase text-[#99775C] flex items-center gap-2 tracking-widest">
                                                        <ClipboardList className="h-4 w-4" /> Laporan Pekerjaan
                                                    </h4>
                                                    <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                                                        "{ev.pekerjaan || "Peserta tidak mengisi laporan pekerjaan."}"
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    {[
                                                        { l: "Kedisiplinan", k: "n1" },
                                                        { l: "Tanggung Jawab", k: "n2" },
                                                        { l: "Inisiatif", k: "n3" },
                                                        { l: "Kerjasama Tim", k: "n4" },
                                                        { l: "Kualitas Kerja", k: "n5", full: true },
                                                    ].map((f) => (
                                                        <div key={f.k} className={`space-y-2 ${f.full ? "md:col-span-2" : ""}`}>
                                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{f.l}</label>
                                                            <Input 
                                                                type="number" 
                                                                max={100}
                                                                placeholder="0-100" 
                                                                value={(nilai as any)[f.k] || ""} 
                                                                onChange={e => setNilai({...nilai, [f.k]: +e.target.value})} 
                                                                className="rounded-2xl h-12 border-slate-200 focus:ring-[#99775C] font-bold" 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <Button 
                                                    className="w-full h-14 rounded-2xl bg-[#99775C] hover:bg-[#7a5e48] text-white font-black text-lg shadow-xl shadow-[#99775C]/20 active:scale-[0.98] transition-all"
                                                    onClick={handleGrade}
                                                    disabled={submitting}
                                                >
                                                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <UserCheck className="mr-2 h-6 w-6" />}
                                                    SIMPAN & TERBITKAN
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        )}
      </div>
    </div>
  );
}