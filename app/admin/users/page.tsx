"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, User, Loader2, Save, Eye, EyeOff, Shield, Mail, Briefcase, Hash } from "lucide-react";
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

export default function AdminUsersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State Modal & Action
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State Visibility Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "INTERN", nip: "", jabatan: ""
  });

  // 1. Fetch Data
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

  // 2. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error("Password tidak cocok!", { description: "Pastikan konfirmasi password sama." });
        return;
    }
    setIsSaving(true);
    try {
        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { ...formData, id: editingId } : formData;
        const res = await fetch("/api/admin/users", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal menyimpan data");
        toast.success(editingId ? "User diperbarui" : "User berhasil ditambahkan");
        setIsDialogOpen(false);
        fetchUsers(); 
        resetForm();
    } catch (error: any) {
        toast.error(error.message || "Terjadi kesalahan");
    } finally {
        setIsSaving(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
        await fetch(`/api/admin/users?id=${deletingId}`, { method: "DELETE" });
        toast.success("User dihapus");
        setUsers(users.filter(u => u.id !== deletingId));
    } catch (error) {
        toast.error("Gagal menghapus");
    } finally {
        setIsAlertOpen(false);
    }
  };

  const resetForm = () => {
      setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "INTERN", nip: "", jabatan: "" });
      setEditingId(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
  };

  const openEdit = (user: any) => {
      setEditingId(user.id);
      setFormData({ 
          name: user.name, 
          email: user.email, 
          password: "", 
          confirmPassword: "",
          role: user.role, 
          nip: user.nip || "", 
          jabatan: user.jabatan || "" 
      });
      setIsDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // STYLE INPUT "KALCER" (Border tebel, rounded gede, focus warna coklat)
  const inputStyle = "h-12 border-2 border-slate-300 dark:border-slate-700 bg-transparent rounded-xl focus-visible:ring-0 focus-visible:border-[#99775C] transition-all font-medium placeholder:text-slate-400";
  const labelStyle = "font-bold text-sm text-slate-700 dark:text-slate-300 mb-1.5 block";

  return (
    <div className="space-y-6">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Manajemen Pengguna</h2>
            <p className="text-slate-500 dark:text-gray-400">Kelola akun admin dan peserta magang.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#99775C] hover:bg-[#7a5e48] text-white shadow-lg shadow-[#99775C]/20 h-11 px-6 rounded-xl font-bold transition-all active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> Tambah User
        </Button>
      </div>

      {/* CARD UTAMA */}
      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] overflow-hidden rounded-2xl">
        
        {/* HEADER CARD */}
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] pb-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#99775C]" />
                    Daftar Pengguna Sistem
                </CardTitle>

                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#99775C] transition-colors" />
                    <Input 
                        placeholder="Cari nama atau email..." 
                        className="pl-10 bg-slate-50 dark:bg-[#292524] border-slate-200 dark:border-[#3f2e26] h-10 text-sm rounded-xl focus-visible:ring-[#99775C] transition-all" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>

        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-[#99775C]">
                    <TableRow className="hover:bg-[#99775C] border-none">
                        <TableHead className="text-white font-bold w-14 text-center pl-4">No</TableHead>
                        <TableHead className="text-white font-bold">User Profile</TableHead>
                        <TableHead className="text-white font-bold">NIP / NIM</TableHead>
                        <TableHead className="text-white font-bold">Role</TableHead>
                        <TableHead className="text-white font-bold">Jabatan</TableHead>
                        <TableHead className="text-white font-bold text-right pr-6">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-500 flex flex-col items-center justify-center gap-2"><Loader2 className="h-6 w-6 animate-spin text-[#99775C]" /> Memuat data...</TableCell></TableRow>
                    ) : filteredUsers.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-500">Tidak ada user ditemukan.</TableCell></TableRow>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <TableRow key={user.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524] transition-colors group">
                                <TableCell className="text-center font-bold text-slate-500 pl-4">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white dark:border-[#292524] shadow-sm group-hover:scale-105 transition-transform">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-[#99775C] text-white font-bold">{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-[#EAE7DD]">{user.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-gray-400 font-mono text-xs font-semibold">
                                    {user.nip || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`font-bold px-3 py-1 rounded-lg ${user.role === 'ADMIN' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-[#99775C] text-[#99775C] bg-[#EAE7DD]/30'}`}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                                    {user.jabatan || "-"}
                                </TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg" onClick={() => openEdit(user)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg" onClick={() => { setDeletingId(user.id); setIsAlertOpen(true); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* DIALOG ADD/EDIT USER - FORM KALCER */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#1c1917] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
            <DialogHeader className="px-8 pt-8 pb-4 bg-slate-50/50 dark:bg-[#292524]/50 border-b border-slate-100 dark:border-[#292524]">
                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-3">
                    <div className="p-2 bg-[#99775C] rounded-lg text-white">
                        {editingId ? <Edit className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </div>
                    {editingId ? "Edit Data User" : "Tambah User Baru"}
                </DialogTitle>
                <DialogDescription>
                    Lengkapi informasi pengguna di bawah ini dengan benar.
                </DialogDescription>
            </DialogHeader>
            
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECTION 1: DATA UTAMA */}
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
                    
                    {/* SECTION 2: KEAMANAN (CARD STYLE) */}
                    <div className="p-5 bg-slate-50 dark:bg-[#292524]/50 rounded-2xl border-2 border-slate-100 dark:border-[#292524] space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-[#99775C]" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Keamanan Akun</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className={labelStyle}>Password {editingId && <span className="text-slate-400 font-normal">(Opsional)</span>}</Label>
                                <div className="relative">
                                    <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Masukkan Password" required={!editingId} className={`${inputStyle} pr-12 bg-white dark:bg-black/20`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className={labelStyle}>Konfirmasi Password</Label>
                                <div className="relative">
                                    <Input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Ulangi Password" required={!editingId || !!formData.password} className={`${inputStyle} pr-12 bg-white dark:bg-black/20 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500 focus-visible:border-red-500" : ""}`} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#99775C] transition-colors">{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: JABATAN & ROLE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <Label className={labelStyle}>Role Akses</Label>
                            <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                                <SelectTrigger className={`${inputStyle} bg-white dark:bg-[#1c1917]`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INTERN">Peserta Magang</SelectItem>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className={labelStyle}>NIP / NIM</Label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} placeholder="" className={`${inputStyle} pl-12`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className={labelStyle}>Jabatan</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})} placeholder="" className={`${inputStyle} pl-12`} />
                            </div>
                        </div>
                    </div>

                </form>
            </div>

            <DialogFooter className="px-8 py-6 border-t border-slate-100 dark:border-[#292524] bg-slate-50/30 dark:bg-[#292524]/30">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-xl border-2 font-bold text-slate-600 hover:bg-slate-100">Batal</Button>
                <Button form="user-form" type="submit" className="bg-[#99775C] hover:bg-[#7a5e48] text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-[#99775C]/20 transition-all active:scale-95" disabled={isSaving || (formData.password !== formData.confirmPassword)}>
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Simpan Data
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <AlertDialogTitle className="text-center text-xl font-bold">Hapus Pengguna?</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                    Yakin nih mau hapus user ini? Data yang udah dihapus <b>gak bisa balik lagi</b> lho.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
                <AlertDialogCancel className="h-11 px-6 rounded-xl font-bold">Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white h-11 px-6 rounded-xl font-bold">
                    Ya, Hapus Permanen
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}