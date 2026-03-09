"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Loader2, Star, UserCheck, Search, 
  ChevronRight, ClipboardList, Award, TrendingUp, Printer,
  User, School, BookOpen, Briefcase, Hash, FileText, CheckCircle2,
  LayoutDashboard, Clock, FileBadge
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
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DIVISI_OPTIONS = [
    "Sub Bagian Keuangan",
    "Sub Bagian Kepegawaian",
    "Sub Bagian Umum",
    "Bidang Perencanaan dan Pengembangan Mutu Pendidikan, Pemuda, dan Olahraga",
    "Bidang Pembinaan Sekolah Menengah Atas",
    "Bidang Pembinaan Sekolah Menengah Kejuruan",
    "Bidang Pendidikan Khusus dan Layanan Khusus",
];

// --- HELPER UNTUK PREVIEW CROSSCHECK ---
const formatTanggal = (dateString: any) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateString));
};

const hitungHariKerja = (start: any, end: any) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

    let count = 0;
    let curDate = new Date(d1);
    while (curDate <= d2) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

export default function AdminPenilaianPage() {
  const { data: session } = useSession();
  const isKepegawaian = session?.user?.divisi === "Sub Bagian Kepegawaian"; 

  const [evals, setEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State global
  const [globalKadis, setGlobalKadis] = useState("Memuat...");

  const [nilai, setNilai] = useState({ n1: 0, n2: 0, n3: 0, n4: 0, n5: 0 });
  const [nomorSurat, setNomorSurat] = useState("");
  const [editDataDiri, setEditDataDiri] = useState({
    name: "", nomorInduk: "", instansi: "", jurusan: "", divisi: ""
  });

  // --- STATE BARU BUAT NAMPUNG HASIL EDITAN PDF (+ Tanggal Split & Teks Cetak) ---
  const [editPreview, setEditPreview] = useState({
    kepalaDinas: "",
    lamaHari: "",
    tanggalPelaksanaan: "", 
    tglMulai: "", 
    tglSelesai: "",
    teksCetakPekerjaan: "" // <-- STATE BARU: Teks override buat cetakan
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEvals = () => {
    setLoading(true);
    fetch("/api/admin/final-evaluation")
      .then(res => res.json())
      .then(data => {
        setEvals(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("Gagal memuat data penilaian."))
      .finally(() => setLoading(false));
  };

  const fetchSettings = () => {
      fetch("/api/admin/settings")
        .then(res => res.json())
        .then(data => setGlobalKadis(data.kepalaDinasName || "Belum Diatur"))
        .catch(() => setGlobalKadis("Gagal Memuat Data"));
  };

  useEffect(() => { 
      fetchEvals(); 
      fetchSettings();
  }, []);

  // --- LOGIC AUTO-UPDATE SAAT KALENDER DIUBAH ---
  const handleCustomDateChange = (start: string, end: string) => {
      const rawHari = hitungHariKerja(start, end);
      const rawTanggal = start && end ? `${formatTanggal(start)} s.d ${formatTanggal(end)}` : "-";
      
      setEditPreview(prev => ({
          ...prev,
          tglMulai: start,
          tglSelesai: end,
          lamaHari: `${rawHari} Hari Kerja`,
          tanggalPelaksanaan: rawTanggal
      }));
  };

  const handleGrade = async () => {
    if (Object.values(nilai).some(v => v < 0 || v > 100)) {
      return toast.error("Validasi Gagal", { description: "Nilai harus antara 0 - 100." });
    }
    
    // ERROR HANDLING MAKSIMAL KARAKTER OUTPUT KERJA
    if (editPreview.teksCetakPekerjaan.length > 300) {
        return toast.error("Teks Terlalu Panjang", { description: "Laporan Keluaran Magang maksimal 300 karakter."});
    }

    setSubmitting(true);
    try {
      const payload = { 
          id: selectedEval?.id, 
          ...nilai,
          nomorSurat: isKepegawaian ? nomorSurat : selectedEval?.nomorSurat,
          userData: editDataDiri,
          userId: selectedEval?.user.id,
          pekerjaan: editPreview.teksCetakPekerjaan, // Teks yang beneran dicetak nimpa DB `pekerjaan`
          previewData: {
              kepalaDinas: editPreview.kepalaDinas,
              lamaHari: editPreview.lamaHari,
              tanggalPelaksanaan: editPreview.tanggalPelaksanaan 
          } 
      };

      const res = await fetch("/api/admin/final-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Berhasil", { description: "Penilaian dan profil telah diperbarui." });
        fetchEvals();
        setIsDialogOpen(false);
      }
    } catch (err) {
      toast.error("Terjadi Kesalahan", { description: "Gagal menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvals = evals.filter((ev) => 
    ev.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Penilaian Kelulusan</h2>
            <p className="text-slate-500 dark:text-gray-400">Verifikasi laporan akhir dan pemberian skor kinerja peserta.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                <Input 
                    placeholder="Cari nama peserta..." 
                    className="pl-10 bg-white dark:bg-[#1c1917] border-slate-200 h-10 w-full sm:w-64 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={fetchEvals} variant="outline" className="h-10 rounded-xl border-slate-200 bg-white">
                <TrendingUp className="h-4 w-4 mr-2 text-[#99775C]" /> Refresh
            </Button>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Total Masuk", val: evals.length, icon: User, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "Belum Dinilai", val: evals.filter((e) => e.status === "PENDING").length, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-100" },
            { label: "Telah Dinilai", val: evals.filter((e) => e.status === "GRADED").length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
        ].map((s, i) => (
            <Card key={i} className="shadow-sm border-slate-200 dark:border-[#292524] bg-white dark:bg-[#1c1917] relative overflow-hidden h-auto flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md rounded-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><s.icon className={`w-20 h-20 ${s.color}`} /></div>
                <CardContent className="p-6 flex items-center gap-4 relative z-10">
                    <div className={`h-12 w-12 ${s.bg} rounded-2xl flex items-center justify-center`}>
                        <s.icon className={`h-6 w-6 ${s.color}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{s.label}</p>
                        <p className="text-xl font-bold dark:text-white tracking-tight">{s.val} Peserta</p>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* TABLE SECTION */}
      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-[#99775C]" /> Daftar Evaluasi Magang
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#99775C]">
                        <TableRow className="hover:bg-[#99775C] border-none">
                            <TableHead className="text-white font-bold px-6 whitespace-nowrap">Nama Lengkap</TableHead>
                            <TableHead className="text-white font-bold whitespace-nowrap">NIM / NIP</TableHead>
                            <TableHead className="text-white font-bold whitespace-nowrap">Sekolah / Kampus</TableHead>
                            <TableHead className="text-white font-bold whitespace-nowrap">Jurusan</TableHead>
                            <TableHead className="text-white font-bold whitespace-nowrap">Divisi</TableHead>
                            <TableHead className="text-white font-bold whitespace-nowrap">Status</TableHead>
                            <TableHead className="text-white font-bold text-center whitespace-nowrap">Rata-rata</TableHead>
                            <TableHead className="text-white font-bold text-right px-6 whitespace-nowrap">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : filteredEvals.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-500">Data evaluasi tidak ditemukan.</TableCell></TableRow>
                        ) : (
                            filteredEvals.map((ev) => (
                                <TableRow key={ev.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3 whitespace-nowrap">
                                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${ev.user?.name}`} />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                            <span className="font-bold text-slate-800 dark:text-[#EAE7DD]">{ev.user?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-slate-600 whitespace-nowrap">{ev.user?.nomorInduk || "-"}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-600 whitespace-nowrap">{ev.user?.internProfile?.instansi || "-"}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-600 whitespace-nowrap">{ev.user?.internProfile?.jurusan || "-"}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                            {ev.user?.divisi || "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-bold px-2.5 py-0.5 rounded-lg border-2 ${ev.status === 'GRADED' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-orange-100 text-orange-600 bg-orange-50 animate-pulse'}`}>
                                            {ev.status === 'GRADED' ? 'DINILAI' : 'PENDING'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-[#99775C]">
                                        {ev.rataRata ? ev.rataRata.toFixed(1) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 font-bold"
                                            onClick={() => {
                                                setSelectedEval(ev);
                                                setNomorSurat(ev.nomorSurat || "");
                                                setEditDataDiri({
                                                  name: ev.user.name || "",
                                                  nomorInduk: ev.user.nomorInduk || "",
                                                  instansi: ev.user.internProfile?.instansi || "",
                                                  jurusan: ev.user.internProfile?.jurusan || "",
                                                  divisi: ev.user.divisi || ""
                                                });
                                                setNilai({ 
                                                    n1: ev.nilaiDisiplin || 0, n2: ev.nilaiTanggungJawab || 0, 
                                                    n3: ev.nilaiKerjasama || 0, n4: ev.nilaiInisiatif || 0, n5: ev.nilaiSikap || 0 
                                                });

                                                // --- SETUP DEFAULT VALUE & TANGGAL BUAT DIEDIT ---
                                                const defStart = ev.user?.internProfile?.startDate ? new Date(ev.user.internProfile.startDate).toISOString().split('T')[0] : "";
                                                const defEnd = ev.user?.internProfile?.endDate ? new Date(ev.user.internProfile.endDate).toISOString().split('T')[0] : "";
                                                const rawHari = hitungHariKerja(defStart, defEnd);
                                                const rawTanggal = `${formatTanggal(defStart)} s.d ${formatTanggal(defEnd)}`;

                                                setEditPreview({
                                                    kepalaDinas: ev.customKepalaDinas || globalKadis,
                                                    lamaHari: ev.customLamaHari || `${rawHari} Hari Kerja`,
                                                    tanggalPelaksanaan: ev.customTanggalPelaksanaan || rawTanggal,
                                                    tglMulai: defStart,
                                                    tglSelesai: defEnd,
                                                    teksCetakPekerjaan: ev.pekerjaan || "" // Default isinya dr db pekerjaan
                                                });

                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            Kelola <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM KELOLA */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-none shadow-2xl bg-white dark:bg-[#0c0a09] scrollbar-hide">
            <DialogHeader className="p-8 bg-slate-50 dark:bg-[#1c1917] border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Award className="h-6 w-6 text-[#99775C]" /> Lembar Evaluasi
                        </DialogTitle>
                        <DialogDescription>Input penilaian akhir dan verifikasi profil peserta.</DialogDescription>
                    </div>
                    {selectedEval?.status === "GRADED" && isKepegawaian && (
                        <Button variant="outline" size="sm" onClick={() => window.open(`/api/admin/cetak-suket?userId=${selectedEval.user.id}`, '_blank')} className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-10 px-4 rounded-xl font-bold">
                            <Printer className="h-4 w-4 mr-2" /> Cetak PDF
                        </Button>
                    )}
                </div>
            </DialogHeader>
            
            <div className="p-8 space-y-10">
                
                {/* 1. NOMOR SURAT */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${isKepegawaian ? "border-[#99775C] bg-[#99775C]/5" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                    <Label className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2 tracking-widest">
                        <Hash className="h-4 w-4 text-[#99775C]" /> Nomor Surat Keterangan
                    </Label>
                    <Input 
                        value={nomorSurat}
                        onChange={(e) => setNomorSurat(e.target.value)}
                        disabled={!isKepegawaian}
                        placeholder={isKepegawaian ? "Contoh: 800/223/PEG/2026" : "Akses khusus Subbag Kepegawaian"}
                        className="h-12 rounded-xl border-slate-200 bg-white font-bold focus-visible:ring-[#99775C]"
                    />
                </div>

                {/* --- SEKSI BARU: PREVIEW DATA CETAK (EDITABLE & DATEPICKER) --- */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <FileBadge className="h-4 w-4 text-[#99775C]" /> Data Surat (Bisa Diedit Manual)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-[#292524]">
                        
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1">Kepala Dinas Penanda Tangan</Label>
                            <Input 
                                value={editPreview.kepalaDinas} 
                                onChange={e => setEditPreview({...editPreview, kepalaDinas: e.target.value})}
                                className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold focus-visible:ring-[#99775C]" 
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1">Tanggal Mulai Magang</Label>
                            <Input 
                                type="date" 
                                value={editPreview.tglMulai} 
                                onChange={e => handleCustomDateChange(e.target.value, editPreview.tglSelesai)} 
                                className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold focus-visible:ring-[#99775C]" 
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1">Tanggal Selesai Magang</Label>
                            <Input 
                                type="date" 
                                value={editPreview.tglSelesai} 
                                onChange={e => handleCustomDateChange(editPreview.tglMulai, e.target.value)} 
                                className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold focus-visible:ring-[#99775C]" 
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-[11px] font-bold text-slate-500 ml-1">Lama Hari Kerja (Dihitung Otomatis & Bisa Ditulis Manual)</Label>
                            <Input 
                                value={editPreview.lamaHari} 
                                onChange={e => setEditPreview({...editPreview, lamaHari: e.target.value})}
                                className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold focus-visible:ring-[#99775C]" 
                            />
                        </div>
                    </div>
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-[#292524]" />

                {/* 2. DATA DIRI SECTION */}
                <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <User className="h-4 w-4 text-[#99775C]" /> Verifikasi Identitas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-[#292524]">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-400 ml-1">Nama Lengkap</Label>
                            <Input value={editDataDiri.name} onChange={e => setEditDataDiri({...editDataDiri, name: e.target.value})} className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-400 ml-1">NIM / NIP</Label>
                            <Input value={editDataDiri.nomorInduk} onChange={e => setEditDataDiri({...editDataDiri, nomorInduk: e.target.value})} className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-400 ml-1">Sekolah / Universitas</Label>
                            <Input value={editDataDiri.instansi} onChange={e => setEditDataDiri({...editDataDiri, instansi: e.target.value})} className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-400 ml-1">Program Studi</Label>
                            <Input value={editDataDiri.jurusan} onChange={e => setEditDataDiri({...editDataDiri, jurusan: e.target.value})} className="rounded-xl h-11 bg-white dark:bg-[#1c1917] font-semibold" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-[11px] font-bold text-slate-400 ml-1">Divisi Penempatan</Label>
                            <Select value={editDataDiri.divisi} onValueChange={(val) => setEditDataDiri({...editDataDiri, divisi: val})}>
                                <SelectTrigger className="h-11 bg-white dark:bg-[#1c1917] border-slate-200 rounded-xl font-semibold">
                                    <SelectValue placeholder="Pilih Divisi" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#1c1917]">
                                    {DIVISI_OPTIONS.map((divisi) => (
                                        <SelectItem key={divisi} value={divisi}>{divisi}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 3. PENILAIAN SECTION */}
                <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#99775C]" /> Parameter Kinerja (0 - 100)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Sikap dan Etika", key: "n5" },
                            { label: "Kedisiplinan", key: "n1" },
                            { label: "Tanggung Jawab", key: "n2" },
                            { label: "Kerjasama Tim", key: "n3" },
                            { label: "Inisiatif & Inovasi", key: "n4" },
                        ].map((f) => (
                            <div key={f.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-[#292524]">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{f.label}</Label>
                                <Input 
                                    type="number" 
                                    max={100}
                                    value={(nilai as any)[f.key] || ""} 
                                    onChange={e => setNilai({...nilai, [f.key]: +e.target.value})} 
                                    className="w-16 h-10 text-center rounded-xl border-slate-200 dark:bg-[#1c1917] font-black text-base" 
                                />
                            </div>
                        ))}
                        <div className="flex items-center justify-between p-4 bg-[#99775C] text-white rounded-2xl shadow-lg">
                            <Label className="text-sm font-black uppercase tracking-widest">Rerata Skor</Label>
                            <div className="font-black text-xl">{((nilai.n1 + nilai.n2 + nilai.n3 + nilai.n4 + nilai.n5) / 5).toFixed(1)}</div>
                        </div>
                    </div>
                </div>

                {/* 4. OUTPUT PESERTA SECTION */}
<div className="space-y-4 pb-4">
    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
        <FileText className="h-4 w-4 text-[#99775C]" /> Laporan Luaran Magang
    </h4>
    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border border-slate-100 dark:border-[#292524] space-y-6 overflow-hidden">
        
        {/* Teks Asli dari Peserta - FIX: break-words maksa turun kebawah */}
        <div className="space-y-2 w-full">
            <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Input Asli Peserta (Hanya Referensi)</Label>
            <div className="p-4 bg-slate-100 dark:bg-black/20 text-slate-500 rounded-xl text-sm leading-loose italic break-words whitespace-normal w-full">
                "{selectedEval?.pekerjaan || "Peserta tidak mengunggah laporan rincian pekerjaan."}"
            </div>
        </div>

        {/* Teks Final (Editable) */}
        <div className="space-y-2 w-full">
            <div className="flex justify-between items-end">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase">Teks Final (Akan Dicetak ke PDF)</Label>
                <span className={`text-[10px] font-bold ${editPreview.teksCetakPekerjaan.length > 300 ? "text-red-500 animate-pulse" : "text-slate-400"}`}>
                    {editPreview.teksCetakPekerjaan.length} / 300 Karakter
                </span>
            </div>
            <Textarea 
                value={editPreview.teksCetakPekerjaan}
                onChange={e => setEditPreview({...editPreview, teksCetakPekerjaan: e.target.value})}
                className={`rounded-xl min-h-[120px] bg-white dark:bg-[#1c1917] resize-none focus-visible:ring-[#99775C] font-medium leading-relaxed break-words w-full ${editPreview.teksCetakPekerjaan.length > 300 ? "border-red-500" : ""}`}
                placeholder="Ketikan deskripsi tugas akhir di sini..."
            />
            {editPreview.teksCetakPekerjaan.length > 300 && (
                <p className="text-[10px] text-red-500 font-bold italic">Maksimal 300 karakter Mek!</p>
            )}
        </div>
    </div>
</div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 dark:bg-[#1c1917] border-t border-slate-100 dark:border-[#292524] flex flex-col sm:flex-row gap-3">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold text-slate-500">Batal</Button>
                <Button 
                    className="h-12 flex-1 rounded-xl bg-[#99775C] hover:bg-[#7a5e48] text-white font-black shadow-xl shadow-[#99775C]/20 transition-all active:scale-95 disabled:opacity-50"
                    onClick={handleGrade}
                    disabled={submitting || editPreview.teksCetakPekerjaan.length > 300} // <-- TOMBOL DISABLE KALO KELEBIHAN KARAKTER
                >
                    {submitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <UserCheck className="mr-2 h-5 w-5" />}
                    SIMPAN & VERIFIKASI
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}