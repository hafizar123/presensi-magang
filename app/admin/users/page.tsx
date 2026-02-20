"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, User, Loader2, Save, Eye, EyeOff, Shield, Mail, Briefcase, Hash, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 5;

const DIVISI_OPTIONS = [
    "Sub Bagian Keuangan",
    "Sub Bagian Kepegawaian",
    "Sub Bagian Umum",
    "Bidang Perencanaan dan Pengembangan Mutu Pendidikan, Pemuda, dan Olahraga",
    "Bidang Pembinaan Sekolah Menengah Atas",
    "Bidang Pembinaan Sekolah Menengah Kejuruan",
    "Bidang Pendidikan Khusus dan Layanan Khusus",
];

export default function AdminUsersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE FILTERING BARU
  const [search, setSearch] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("ALL");
  
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [openDivisi, setOpenDivisi] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "INTERN", nip: "", jabatan: ""
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Gagal mengambil data user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error("Password tidak cocok!"); return;
    }
    
    if (formData.jabatan && !DIVISI_OPTIONS.includes(formData.jabatan)) {
        toast.error("Pilih divisi dari list yang udah ada bro!"); return;
    }

    setIsSaving(true);
    try {
        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { ...formData, id: editingId } : formData;
        const res = await fetch("/api/admin/users", {
            method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        toast.success(editingId ? "User diperbarui" : "User ditambahkan");
        setIsDialogOpen(false); fetchUsers(); resetForm();
    } catch (error: any) { toast.error(error.message); } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
        await fetch(`/api/admin/users?id=${deletingId}`, { method: "DELETE" });
        toast.success("User dihapus");
        setUsers(users.filter(u => u.id !== deletingId));
    } catch (error) { toast.error("Gagal menghapus"); } finally { setIsAlertOpen(false); }
  };

  const resetForm = () => {
      setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "INTERN", nip: "", jabatan: "" });
      setEditingId(null); setShowPassword(false); setShowConfirmPassword(false);
  };

  const openEdit = (user: any) => {
      setEditingId(user.id);
      setFormData({ 
          name: user.name, email: user.email, password: "", confirmPassword: "",
          role: user.role, nip: user.nip || "", jabatan: user.jabatan || "" 
      });
      setIsDialogOpen(true);
  };

  // 🔥 LOGIC FILTER DIVISI & SEARCH GABUNGAN 🔥
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesDivisi = filterDivisi === "ALL" ? true : user.jabatan === filterDivisi;
    return matchesSearch && matchesDivisi;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  // Reset page kalo lu ngetik atau milih divisi
  useEffect(() => { setCurrentPage(1); }, [search, filterDivisi]);

  const filteredDivisiOptions = DIVISI_OPTIONS.filter(d => 
    d.toLowerCase().includes(formData.jabatan.toLowerCase())
  );

  const inputStyle = "h-12 border-2 border-slate-300 dark:border-slate-700 bg-transparent rounded-xl focus-visible:ring-0 focus-visible:border-[#99775C] transition-all font-medium placeholder:text-slate-400";
  const labelStyle = "font-bold text-sm text-slate-700 dark:text-slate-300 mb-1.5 block";

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Manajemen Pengguna</h2>
            <p className="text-slate-500 dark:text-gray-400">Kelola akun admin dan peserta magang.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#99775C] hover:bg-[#7a5e48] text-white shadow-lg shadow-[#99775C]/20 h-11 px-6 rounded-xl font-bold transition-all active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> Tambah User
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] pb-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#99775C]" /> Daftar Pengguna Sistem
                </CardTitle>
                
                {/* 🔥 ACTION BAR (Filter Divisi & Search) 🔥 */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    
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

                    {/* SEARCH */}
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                        <Input placeholder="Cari nama atau email..." className="pl-10 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] h-10 text-sm rounded-xl focus-visible:ring-[#99775C] transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
        </CardHeader>

        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-[#99775C]">
                    <TableRow className="hover:bg-[#99775C] border-none">
                        <TableHead className="text-white font-bold w-14 text-center pl-4">No</TableHead>
                        <TableHead className="text-white font-bold min-w-[200px]">Nama Lengkap</TableHead>
                        <TableHead className="text-white font-bold">Email</TableHead>
                        <TableHead className="text-white font-bold">NIP / NIM</TableHead>
                        <TableHead className="text-white font-bold">Role</TableHead>
                        <TableHead className="text-white font-bold">Divisi</TableHead>
                        <TableHead className="text-white font-bold text-right pr-6">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-[#99775C] mx-auto mb-2" /> Memuat data...</TableCell></TableRow>
                    ) : filteredUsers.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500">Tidak ada user ditemukan.</TableCell></TableRow>
                    ) : (
                        paginatedUsers.map((user, index) => (
                            <TableRow key={user.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524] transition-colors group">
                                <TableCell className="text-center font-medium text-slate-500 pl-4">
                                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border-2 border-white dark:border-[#292524] shadow-sm">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-[#99775C] text-white font-bold">{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-bold text-slate-800 dark:text-[#EAE7DD]">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                                <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400">{user.nip || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`font-bold px-2.5 py-0.5 rounded-lg border-2 ${user.role === 'ADMIN' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-[#99775C] text-[#99775C] bg-[#EAE7DD]/30'}`}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                            {user.jabatan || "-"}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg" onClick={() => openEdit(user)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg" onClick={() => { setDeletingId(user.id); setIsAlertOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>

        {totalPages > 1 && (
            <div className="border-t border-slate-100 dark:border-[#292524] p-4 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <p className="text-sm text-slate-500">
                    Halaman <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-[#3f2e26]"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-[#3f2e26]"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#1c1917] p-0 overflow-visible border-none rounded-2xl shadow-2xl">
            <DialogHeader className="px-8 pt-8 pb-4 bg-slate-50/50 dark:bg-[#292524]/50 border-b border-slate-100 dark:border-[#292524]">
                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-3">
                    <div className="p-2 bg-[#99775C] rounded-lg text-white">
                        {editingId ? <Edit className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </div>
                    {editingId ? "Edit Data User" : "Tambah User Baru"}
                </DialogTitle>
                <DialogDescription>Lengkapi informasi pengguna di bawah ini dengan benar.</DialogDescription>
            </DialogHeader>
            <div className="px-8 py-6 max-h-[70vh] overflow-y-visible">
                <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Label className={labelStyle}>Nama Lengkap</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukkan Nama Lengkap" className={`${inputStyle} pl-12`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className={labelStyle}>Alamat Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Masukkan Email" className={`${inputStyle} pl-12`} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-5 bg-slate-50 dark:bg-[#292524]/50 rounded-2xl border-2 border-slate-100 dark:border-[#292524] space-y-4">
                        <div className="flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-[#99775C]" /><h3 className="font-bold text-slate-700 dark:text-slate-200">Keamanan Akun</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className={labelStyle}>Password {editingId && <span className="text-slate-400 font-normal">(Opsional)</span>}</Label>
                                <div className="relative">
                                    <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="******" required={!editingId} className={`${inputStyle} pr-12 bg-white dark:bg-black/20`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className={labelStyle}>Konfirmasi Password</Label>
                                <div className="relative">
                                    <Input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="******" required={!editingId || !!formData.password} className={`${inputStyle} pr-12 bg-white dark:bg-black/20 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500 focus-visible:border-red-500" : ""}`} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] transition-colors">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <Label className={labelStyle}>Role Akses</Label>
                            <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                                <SelectTrigger className={`${inputStyle} bg-white dark:bg-[#1c1917]`}><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="INTERN">Peserta Magang</SelectItem><SelectItem value="ADMIN">Administrator</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className={labelStyle}>NIP / NIM</Label>
                            <div className="relative"><Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><Input value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} placeholder="" className={`${inputStyle} pl-12`} /></div>
                        </div>

                        <div className="space-y-1 relative">
                            <Label className={labelStyle}>Divisi</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                                <Input 
                                    value={formData.jabatan} 
                                    onChange={(e) => { 
                                        setFormData({...formData, jabatan: e.target.value}); 
                                        setOpenDivisi(true); 
                                    }} 
                                    onFocus={() => setOpenDivisi(true)}
                                    onBlur={() => setTimeout(() => {
                                        setOpenDivisi(false);
                                        setFormData(prev => ({
                                            ...prev, 
                                            jabatan: DIVISI_OPTIONS.includes(prev.jabatan) ? prev.jabatan : ""
                                        }));
                                    }, 150)}
                                    placeholder="Pilih divisi..." 
                                    className={`${inputStyle} pl-12 pr-10 relative z-0`} 
                                />
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-50 pointer-events-none" />
                            </div>
                            
                            {openDivisi && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1c1917] border border-slate-200 dark:border-[#3f2e26] rounded-md shadow-md max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                                    <div className="p-1">
                                        {filteredDivisiOptions.length > 0 ? (
                                            filteredDivisiOptions.map(div => (
                                                <div 
                                                    key={div} 
                                                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#292524] dark:hover:text-slate-50 transition-colors font-medium text-slate-700 dark:text-slate-300"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); 
                                                        setFormData({...formData, jabatan: div});
                                                        setOpenDivisi(false);
                                                    }}
                                                >
                                                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                                        {formData.jabatan === div && <Check className="h-4 w-4" />}
                                                    </span>
                                                    {div}
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
                    </div>
                </form>
            </div>
            <DialogFooter className="px-8 py-6 border-t border-slate-100 dark:border-[#292524] bg-slate-50/30 dark:bg-[#292524]/30">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-xl border-2 font-bold text-slate-600 hover:bg-slate-100">Batal</Button>
                <Button form="user-form" type="submit" className="bg-[#99775C] hover:bg-[#7a5e48] text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-[#99775C]/20 transition-all active:scale-95" disabled={isSaving || (formData.password !== formData.confirmPassword)}>{isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Simpan Data</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-8 w-8 text-red-600" /></div>
                <AlertDialogTitle className="text-center text-xl font-bold">Hapus Pengguna?</AlertDialogTitle>
                <AlertDialogDescription className="text-center">Yakin nih mau hapus user ini? Data yang udah dihapus <b>gak bisa balik lagi</b> lho.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
                <AlertDialogCancel className="h-11 px-6 rounded-xl font-bold">Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white h-11 px-6 rounded-xl font-bold">Ya, Hapus Permanen</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}