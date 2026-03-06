"use client"; 

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { User, Search, ChevronLeft, ChevronRight, ArrowRight, Calendar, Filter, Briefcase, Edit, Loader2, ChevronDown, Check, GraduationCap, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

interface InternsTableProps {
  interns: any[];
}

const ITEMS_PER_PAGE = 20;

const DIVISI_OPTIONS = [
    "Sub Bagian Keuangan",
    "Sub Bagian Kepegawaian",
    "Sub Bagian Umum",
    "Bidang Perencanaan dan Pengembangan Mutu Pendidikan, Pemuda, dan Olahraga",
    "Bidang Pembinaan Sekolah Menengah Atas",
    "Bidang Pembinaan Sekolah Menengah Kejuruan",
    "Bidang Pendidikan Khusus dan Layanan Khusus",
];

export default function InternsTableClient({ interns }: InternsTableProps) {
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); 
  const [filterDivisi, setFilterDivisi] = useState("ALL"); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  
  const [divisi, setDivisi] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 🚀 LOGIC FILTERING & AUTO-ALUMNI 🚀
  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.name.toLowerCase().includes(search.toLowerCase()) ||
      intern.email.toLowerCase().includes(search.toLowerCase());

    const matchesDivisi = filterDivisi === "ALL" ? true : intern.divisi === filterDivisi;

    const hasProfile = !!intern.internProfile;
    
    // Logic Auto-Alumni (H+2)
    let isAutoAlumni = false;
    if (hasProfile && intern.internProfile.endDate) {
        const endMagang = new Date(intern.internProfile.endDate);
        const today = new Date();
        const limitAlumni = new Date(endMagang);
        limitAlumni.setDate(limitAlumni.getDate() + 2); 
        if (today > limitAlumni) isAutoAlumni = true;
    }

    let matchesStatus = true;
    if (statusFilter === "ACTIVE") {
        matchesStatus = hasProfile && !isAutoAlumni && intern.role !== "ALUMNI";
    } else if (statusFilter === "PENDING") {
        matchesStatus = !hasProfile;
    } else if (statusFilter === "ALUMNI") {
        matchesStatus = isAutoAlumni || intern.role === "ALUMNI";
    }

    return matchesSearch && matchesDivisi && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInterns.length / ITEMS_PER_PAGE);
  const paginatedInterns = filteredInterns.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, filterDivisi]);

  const openEditModal = (user: any) => {
    setSelectedIntern(user);
    setDivisi(user.divisi || ""); 
    if (user.internProfile) {
        setStartDate(new Date(user.internProfile.startDate).toISOString().split("T")[0]);
        setEndDate(new Date(user.internProfile.endDate).toISOString().split("T")[0]);
    } else {
        setStartDate("");
        setEndDate("");
    }
    setIsEditOpen(true);
  };

  const handleSave = async (manualRole?: string) => {
    if (!selectedIntern) return;
    setIsSaving(true);
    try {
        const payload: any = {
            id: selectedIntern.id, 
            divisi: divisi,      
            startDate: startDate,  
            endDate: endDate
        };
        if (manualRole) payload.role = manualRole;

        const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsEditOpen(false);
            toast.success(manualRole === "ALUMNI" ? "User dipindahkan ke Alumni!" : "Data berhasil diperbarui!");
            router.refresh(); 
        } else {
            toast.error("Gagal memperbarui data.");
        }
    } catch (err) {
        toast.error("Kesalahan jaringan.");
    } finally {
        setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      
      {/* MODAL EDIT */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] rounded-2xl">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold">Atur Data Magang</DialogTitle>
                <DialogDescription>
                    Update data atau status untuk <b>{selectedIntern?.name}</b>.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                    <Label className="font-bold text-xs uppercase text-slate-400">Divisi</Label>
                    <Select value={divisi} onValueChange={setDivisi}>
                        <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Pilih Divisi" />
                        </SelectTrigger>
                        <SelectContent>
                            {DIVISI_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase text-slate-400">Mulai</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase text-slate-400">Selesai</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
                    </div>
                </div>

                {selectedIntern?.role !== "ALUMNI" && (
                    <Button 
                        variant="outline" 
                        className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl h-11 font-bold"
                        onClick={() => handleSave("ALUMNI")}
                    >
                        <GraduationCap className="h-4 w-4 mr-2" /> Pindahkan ke Alumni
                    </Button>
                )}
            </div>
            <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Batal</Button>
                <Button onClick={() => handleSave()} disabled={isSaving} className="bg-[#99775C] hover:bg-[#7a5e48] text-white rounded-xl flex-1">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-[#EAE7DD]">Manajemen User</h1>
              <p className="text-slate-500">Database peserta magang dan alumni.</p>
          </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] pb-4 bg-white/50 dark:bg-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              {/* 🔥 URUTAN TAB DIUBAH: AKTIF -> PENDING -> ALUMNI 🔥 */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-[#292524] rounded-2xl shrink-0">
                  <Button 
                    variant={statusFilter === "ACTIVE" ? "default" : "ghost"} 
                    onClick={() => setStatusFilter("ACTIVE")}
                    className={`rounded-xl h-9 px-6 font-bold transition-all ${statusFilter === "ACTIVE" ? "bg-white text-[#99775C] shadow-sm hover:bg-white" : "text-slate-500 hover:bg-transparent"}`}
                  >
                    Aktif
                  </Button>
                  <Button 
                    variant={statusFilter === "PENDING" ? "default" : "ghost"} 
                    onClick={() => setStatusFilter("PENDING")}
                    className={`rounded-xl h-9 px-6 font-bold transition-all ${statusFilter === "PENDING" ? "bg-white text-blue-600 shadow-sm hover:bg-white" : "text-slate-500 hover:bg-transparent"}`}
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={statusFilter === "ALUMNI" ? "default" : "ghost"} 
                    onClick={() => setStatusFilter("ALUMNI")}
                    className={`rounded-xl h-9 px-6 font-bold transition-all ${statusFilter === "ALUMNI" ? "bg-white text-orange-600 shadow-sm hover:bg-white" : "text-slate-500 hover:bg-transparent"}`}
                  >
                    Alumni
                  </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="w-full sm:w-[200px]">
                      <Select value={filterDivisi} onValueChange={setFilterDivisi}>
                          <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-[#1c1917]">
                              <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
                              <SelectValue placeholder="Semua Divisi" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="ALL">Semua Divisi</SelectItem>
                              {DIVISI_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="relative w-full sm:w-[250px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                          placeholder="Cari nama..." 
                          className="pl-11 h-11 rounded-xl bg-white dark:bg-[#1c1917]"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                      />
                  </div>
              </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader className="bg-[#99775C]">
                  <TableRow className="hover:bg-[#99775C] border-none">
                    <TableHead className="text-white font-bold pl-8 py-4">Nama Lengkap</TableHead>
                    <TableHead className="text-white font-bold">Divisi</TableHead>
                    <TableHead className="text-white font-bold">Periode</TableHead>
                    <TableHead className="text-white font-bold text-center">Status</TableHead>
                    <TableHead className="text-white font-bold text-right pr-8">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInterns.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium italic">Data tidak ditemukan.</TableCell>
                    </TableRow>
                  ) : (
                    paginatedInterns.map((intern) => (
                        <TableRow key={intern.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-slate-50/50 transition-colors">
                            <TableCell className="pl-8 py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-white">
                                        <AvatarImage src={intern.image} />
                                        <AvatarFallback className="bg-slate-100 text-[#99775C] font-bold">{intern.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 dark:text-[#EAE7DD]">{intern.name}</span>
                                        <span className="text-[11px] text-slate-400 font-medium">{intern.email}</span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                    <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                                    {intern.divisi || "-"}
                                </div>
                            </TableCell>

                            <TableCell>
                                {intern.internProfile ? (
                                    <div className="flex items-center gap-2">
                                        <div className="text-[11px] font-bold px-2 py-1 bg-slate-100 dark:bg-[#292524] rounded-lg border border-slate-200 text-slate-600">
                                            {new Date(intern.internProfile.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </div>
                                        <ArrowRight className="h-3 w-3 text-slate-300" />
                                        <div className="text-[11px] font-bold px-2 py-1 bg-slate-100 dark:bg-[#292524] rounded-lg border border-slate-200 text-slate-600">
                                            {new Date(intern.internProfile.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-300 italic">Belum diatur</span>
                                )}
                            </TableCell>

                            <TableCell className="text-center">
                                {statusFilter === "ALUMNI" ? (
                                    <Badge className="bg-orange-50 text-orange-600 border-orange-200 font-black px-3 py-1 rounded-lg uppercase text-[10px] tracking-widest">
                                        <GraduationCap className="h-3 w-3 mr-1.5" /> Alumni
                                    </Badge>
                                ) : statusFilter === "ACTIVE" ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 font-black px-3 py-1 rounded-lg uppercase text-[10px] tracking-widest">
                                        <UserCheck className="h-3 w-3 mr-1.5" /> Aktif
                                    </Badge>
                                ) : (
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-200 font-black px-3 py-1 rounded-lg uppercase text-[10px] tracking-widest">
                                        <Clock className="h-3 w-3 mr-1.5" /> Pending
                                    </Badge>
                                )}
                            </TableCell>

                            <TableCell className="text-right pr-8">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => openEditModal(intern)}
                                    className="h-9 px-4 rounded-xl font-bold text-blue-600 hover:bg-blue-50"
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>

        {/* PAGINATION */}
        {totalPages > 1 && (
            <div className="p-6 border-t border-slate-50 dark:border-[#292524] flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">
                    Halaman <span className="text-slate-900 dark:text-white font-bold">{currentPage}</span> dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="h-10 w-10 p-0 rounded-xl">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="h-10 w-10 p-0 rounded-xl">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
}