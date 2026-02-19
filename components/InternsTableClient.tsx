"use client"; 

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { User, Search, ChevronLeft, ChevronRight, ArrowRight, Calendar, Filter, Briefcase, Edit, Loader2, ChevronDown, Check } from "lucide-react";
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
    "Kepegawaian",
    "Perencanaan",
    "Umum",
    "Pendidikan Khusus",
    "Pendidikan Menengah",
    "Pendidikan Anak Usia Dini dan Dasar",
    "Balai Tekkomdik",
];

export default function InternsTableClient({ interns }: InternsTableProps) {
  const router = useRouter();
  
  // STATE FILTERING BARU
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filterDivisi, setFilterDivisi] = useState("ALL"); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  
  const [divisi, setDivisi] = useState("");
  const [openDivisi, setOpenDivisi] = useState(false); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 🔥 LOGIC FILTER DIVISI GABUNGAN 🔥
  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.name.toLowerCase().includes(search.toLowerCase()) ||
      intern.email.toLowerCase().includes(search.toLowerCase());

    const isActive = !!intern.internProfile;
    let matchesStatus = true;
    
    if (statusFilter === "ACTIVE") matchesStatus = isActive;
    if (statusFilter === "PENDING") matchesStatus = !isActive;

    const matchesDivisi = filterDivisi === "ALL" ? true : intern.jabatan === filterDivisi;

    return matchesSearch && matchesStatus && matchesDivisi;
  });

  const totalPages = Math.ceil(filteredInterns.length / ITEMS_PER_PAGE);
  const paginatedInterns = filteredInterns.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  // Reset page kalo user mainin filter
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, filterDivisi]);

  const filteredDivisiOptions = DIVISI_OPTIONS.filter(d => 
    d.toLowerCase().includes(divisi.toLowerCase())
  );

  const openEditModal = (user: any) => {
    setSelectedIntern(user);
    setDivisi(user.jabatan || ""); 
    
    if (user.internProfile) {
        setStartDate(new Date(user.internProfile.startDate).toISOString().split("T")[0]);
        setEndDate(new Date(user.internProfile.endDate).toISOString().split("T")[0]);
    } else {
        setStartDate("");
        setEndDate("");
    }
    setOpenDivisi(false);
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!selectedIntern) return;

    if (divisi && !DIVISI_OPTIONS.includes(divisi)) {
        toast.error("Divisi ga ada di list bos, pilih yang bener!");
        return;
    }

    setIsSaving(true);
    try {
        const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedIntern.id, 
                jabatan: divisi,      
                startDate: startDate,  
                endDate: endDate
            })
        });

        if (res.ok) {
            setIsEditOpen(false);
            toast.success("Data berhasil disimpan!");
            router.refresh(); 
        } else {
            toast.error("Gagal update data.");
        }
    } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan sistem.");
    } finally {
        setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] !overflow-visible">
            <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-[#EAE7DD]">Atur Data Magang</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-gray-400">
                    Input divisi dan periode magang untuk <b>{selectedIntern?.name}</b>.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
                
                <div className="grid gap-2 relative">
                    <Label className="text-slate-700 dark:text-gray-300">Divisi</Label>
                    <div className="relative">
                        <Input 
                            placeholder="Pilih divisi..."
                            value={divisi}
                            onChange={(e) => { 
                                setDivisi(e.target.value); 
                                setOpenDivisi(true); 
                            }}
                            onFocus={() => setOpenDivisi(true)}
                            onBlur={() => setTimeout(() => {
                                setOpenDivisi(false);
                                setDivisi(prev => DIVISI_OPTIONS.includes(prev) ? prev : "");
                            }, 150)}
                            className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] pr-10"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-50 pointer-events-none" />
                    </div>
                    
                    {openDivisi && (
                        <div className="absolute top-[100%] left-0 w-full mt-1 z-50 bg-white dark:bg-[#1c1917] border border-slate-200 dark:border-[#3f2e26] rounded-md shadow-md max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                            <div className="p-1">
                                {filteredDivisiOptions.length > 0 ? (
                                    filteredDivisiOptions.map(divItem => (
                                        <div 
                                            key={divItem} 
                                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#292524] dark:hover:text-slate-50 transition-colors font-medium text-slate-700 dark:text-slate-300"
                                            onMouseDown={(e) => {
                                                e.preventDefault(); 
                                                setDivisi(divItem);
                                                setOpenDivisi(false);
                                            }}
                                        >
                                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                                {divisi === divItem && <Check className="h-4 w-4" />}
                                            </span>
                                            {divItem}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-2 pl-2 pr-2 text-center text-sm text-red-500 font-medium italic">
                                        Divisi tidak ditemukan
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-gray-300">Mulai</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26]" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-slate-700 dark:text-gray-300">Selesai</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26]" />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)} className="dark:bg-[#292524] dark:text-[#EAE7DD]">Batal</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HEADER PAGE */}
      <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Data Peserta Magang</h1>
          <p className="text-slate-500 dark:text-gray-400">Database lengkap seluruh anak magang.</p>
      </div>

      {/* CARD UTAMA */}
      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] pb-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-2 whitespace-nowrap">
                <User className="h-5 w-5 text-[#99775C]" />
                Master Data Magang
              </CardTitle>

              {/* 🔥 ACTION BAR (Filter Divisi, Status & Search) 🔥 */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
                  
                  {/* DROPDOWN FILTER DIVISI */}
                  <div className="w-full sm:w-[180px] shrink-0">
                      <Select value={filterDivisi} onValueChange={setFilterDivisi}>
                          <SelectTrigger className="h-10 w-full bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] rounded-xl text-sm font-medium focus:ring-[#99775C]">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                  <SelectValue placeholder="Semua Divisi" />
                              </div>
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524]">
                              <SelectItem value="ALL">Semua Divisi</SelectItem>
                              {DIVISI_OPTIONS.map((divisi) => (
                                  <SelectItem key={divisi} value={divisi}>{divisi}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  {/* FILTER STATUS */}
                  <div className="w-full sm:w-[140px] shrink-0"> 
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-10 w-full bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] rounded-xl text-sm font-medium focus:ring-[#99775C]">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                                <Filter className="h-3.5 w-3.5 shrink-0" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524]">
                            <SelectItem value="ALL">Semua</SelectItem>
                            <SelectItem value="ACTIVE">Aktif</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>

                  {/* SEARCH BAR */}
                  <div className="relative w-full sm:w-[220px] shrink-0 group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                      <Input 
                          placeholder="Cari data..." 
                          className="pl-10 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] h-10 text-sm rounded-xl focus-visible:ring-[#99775C] transition-all"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                      />
                  </div>
              </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              <Table className="min-w-[1400px]">
                <TableHeader className="bg-[#99775C]">
                  <TableRow className="border-none hover:bg-[#99775C]">
                    <TableHead className="w-[60px] text-white font-bold text-center pl-6">No</TableHead>
                    <TableHead className="text-white font-bold min-w-[300px]">Nama Peserta</TableHead>
                    <TableHead className="text-white font-bold min-w-[250px]">Email</TableHead>
                    <TableHead className="text-white font-bold min-w-[250px]">Divisi</TableHead>
                    <TableHead className="text-white font-bold min-w-[320px]">Periode Magang</TableHead>
                    <TableHead className="text-white font-bold text-center min-w-[150px]">Status</TableHead>
                    <TableHead className="text-white font-bold text-right pr-6 min-w-[150px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterns.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-slate-500 dark:text-gray-400">
                            {interns.length === 0 ? "Belum ada data peserta magang." : "Tidak ditemukan data yang sesuai filter."}
                        </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInterns.map((intern, i) => (
                        <TableRow key={intern.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524] transition-colors group">
                            
                            <TableCell className="text-center font-medium text-slate-500 pl-6">
                                {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                            </TableCell>
                            
                            <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-[#292524] shadow-sm">
                                        <AvatarImage src={intern.image} />
                                        <AvatarFallback className="bg-[#99775C] text-white font-bold">{intern.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold text-slate-800 dark:text-[#EAE7DD]">{intern.name}</span>
                                </div>
                            </TableCell>

                            <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {intern.email}
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                        <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                        {intern.jabatan || "-"}
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                                {intern.internProfile ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#292524] rounded-lg border border-slate-200 dark:border-[#3f2e26] text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Calendar className="h-3 w-3 text-[#99775C]" />
                                            {new Date(intern.internProfile.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#292524] rounded-lg border border-slate-200 dark:border-[#3f2e26] text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Calendar className="h-3 w-3 text-red-400" />
                                            {new Date(intern.internProfile.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic pl-2">-</span>
                                )}
                            </TableCell>

                            <TableCell className="text-center whitespace-nowrap">
                                {intern.internProfile ? (
                                    <Badge className="bg-green-100 text-green-700 border-none dark:bg-green-900/30 dark:text-green-400 font-bold px-3 py-1">
                                        Aktif
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50 font-bold px-3 py-1">
                                        Pending
                                    </Badge>
                                )}
                            </TableCell>

                            <TableCell className="text-right pr-6 whitespace-nowrap">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openEditModal(intern)}
                                    className="h-8 border-slate-200 dark:border-[#3f2e26] text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                                >
                                    <Edit className="h-3.5 w-3.5 mr-2" /> Atur
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
            <div className="border-t border-slate-100 dark:border-[#292524] p-4 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <p className="text-sm text-slate-500">
                    Halaman <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-[#3f2e26]">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-[#3f2e26]">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
      </Card>

      <div className="text-xs text-slate-400 dark:text-gray-600 text-center pt-8 border-t border-slate-100 dark:border-[#292524] mt-8">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY
      </div>
    </div>
  );
}