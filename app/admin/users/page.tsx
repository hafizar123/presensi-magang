"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, User, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State Modal
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

  // 2. Handle Submit (Add/Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Password Match (Cuma kalo password diisi)
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

  // Filter Search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">Manajemen Pengguna</h2>
            <p className="text-slate-500 dark:text-gray-400">Kelola akun admin dan peserta magang.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#99775C] hover:bg-[#7a5e48] text-white">
            <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917]">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-[#292524]">
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Cari nama atau email..." 
                    className="pl-9 bg-slate-50 dark:bg-[#292524] border-none text-slate-800 dark:text-slate-200" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                {/* HEADER TABEL COKLAT SORRELL */}
                <TableHeader className="bg-[#99775C]">
                    <TableRow className="hover:bg-[#99775C] border-none">
                        <TableHead className="text-white font-semibold w-12 text-center">No</TableHead>
                        <TableHead className="text-white font-semibold">User Profile</TableHead>
                        <TableHead className="text-white font-semibold">Divisi</TableHead>
                        <TableHead className="text-white font-semibold">NIP / NIM</TableHead>
                        <TableHead className="text-white font-semibold">Role</TableHead>
                        <TableHead className="text-white font-semibold">Jabatan</TableHead>
                        <TableHead className="text-white font-semibold text-center w-28">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">Memuat data...</TableCell></TableRow>
                    ) : filteredUsers.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500">Tidak ada user ditemukan.</TableCell></TableRow>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <TableRow key={user.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-[#EAE7DD]/30 dark:hover:bg-[#292524]">
                                {/* NO */}
                                <TableCell className="text-center font-medium text-slate-500">
                                    {index + 1}
                                </TableCell>

                                {/* USER PROFILE */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-[#99775C]/20">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-[#99775C] text-white">{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-slate-800 dark:text-[#EAE7DD]">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* DIVISI (Placeholder) */}
                                <TableCell className="text-slate-600 dark:text-gray-400 text-sm">
                                    -
                                </TableCell>

                                {/* NIP/NIM */}
                                <TableCell className="text-slate-600 dark:text-gray-400 font-mono text-xs">
                                    {user.nip || "-"}
                                </TableCell>

                                {/* ROLE */}
                                <TableCell>
                                    <Badge variant="outline" className="border-[#99775C] text-[#99775C] dark:text-[#EAE7DD] text-[10px]">
                                        {user.role}
                                    </Badge>
                                </TableCell>

                                {/* JABATAN */}
                                <TableCell className="text-slate-700 dark:text-slate-300 text-sm">
                                    {user.jabatan || "-"}
                                </TableCell>

                                {/* AKSI (LANGSUNG ICON) */}
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            onClick={() => openEdit(user)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => { setDeletingId(user.id); setIsAlertOpen(true); }}
                                        >
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

      {/* DIALOG ADD/EDIT USER - UKURAN LEBIH BESAR (max-w-2xl) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-[#EAE7DD]">
                    {editingId ? "Edit Data User" : "Tambah User Baru"}
                </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
                
                {/* SECTION 1: IDENTITAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukkan Nama Lengkap" className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Masukkan Email" className="h-11" />
                    </div>
                </div>
                
                {/* SECTION 2: PASSWORD (DENGAN TOGGLE MATA) */}
                <div className="p-4 bg-slate-50 dark:bg-[#1c1917] rounded-xl space-y-4 border border-slate-100 dark:border-[#292524]">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Keamanan Akun</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <Label>Password {editingId && "(Opsional)"}</Label>
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                    placeholder="Masukkan Password" 
                                    required={!editingId} 
                                    className="h-11 pr-10" 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 relative">
                            <Label>Konfirmasi Password</Label>
                            <div className="relative">
                                <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={formData.confirmPassword} 
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                                    placeholder="Masukkan Konfirmasi Password" 
                                    required={!editingId || !!formData.password} // Wajib kalau bikin baru ATAU lagi ganti password
                                    className={`h-11 pr-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-[10px] text-red-500 absolute -bottom-4">Password tidak cocok.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ROLE & JABATAN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Role Akses</Label>
                        <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INTERN">Peserta Magang</SelectItem>
                                <SelectItem value="ADMIN">Admin / Pembimbing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>NIP / NIM (Opsional)</Label>
                        <Input value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} placeholder="Masukkan NIP / NIM" className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>Jabatan (Opsional)</Label>
                        <Input value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})} placeholder="Masukkan Jabatan" className="h-11" />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t border-slate-100 dark:border-[#292524]">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11 px-6">Batal</Button>
                    <Button type="submit" className="bg-[#99775C] hover:bg-[#7a5e48] text-white h-11 px-6" disabled={isSaving || (formData.password !== formData.confirmPassword)}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Data
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Akun ini akan dihapus permanen dari database.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    Ya, Hapus
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}