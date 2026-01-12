"use client";

import { useEffect, useState } from "react";
import { 
  Plus, Search, Trash2, Loader2, UserPlus, Shield, User, Mail, Calendar, 
  Pencil, CheckCircle2, Lock, AlertTriangle, X, Eye, EyeOff 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INTERN";
  createdAt: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Modal Add & Edit
  const [openAdd, setOpenAdd] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  
  const [openEdit, setOpenEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // State Modal Delete Success (BARU!)
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
    role: "INTERN" as "ADMIN" | "INTERN",
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Gagal ambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "INTERN" });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // --- HANDLE ADD USER ---
  const handleAddUser = async () => {
    if(!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        return alert("Waduh, isi semua datanya dulu bro!");
    }
    if(formData.password !== formData.confirmPassword) {
        return alert("Password dan Konfirmasi Password Tidak Sesuai!");
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }),
      });

      if (res.ok) {
        setAddSuccess(true); // Munculin Centang
        fetchUsers();
        resetForm();
        // HAPUS TIMEOUT, BIAR USER KLIK TUTUP MANUAL
      } else {
        alert("Gagal bro, cek email mungkin duplikat?");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setIsSaving(false);
    }
  };

  // --- PREPARE EDIT ---
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    setFormData({
        name: user.name,
        email: user.email,
        password: "", 
        confirmPassword: "",
        role: user.role
    });
    setOpenEdit(true);
  };

  // --- HANDLE EDIT USER ---
  const handleEditUser = async () => {
    if(!selectedUser) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
        return alert("Password dan Konfrimasi Password Tidak Sesuai!");
    }

    setIsSaving(true);
    try {
        const payload: any = { 
            id: selectedUser.id, 
            name: formData.name,
            email: formData.email,
            role: formData.role
        };
        if (formData.password) {
            payload.password = formData.password;
        }

        const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            setEditSuccess(true); // Munculin Centang
            fetchUsers();
            // HAPUS TIMEOUT, MANUAL CLOSE
        } else {
            alert("Gagal update user");
        }
    } catch (error) {
        alert("Error server");
    } finally {
        setIsSaving(false);
    }
  };

  // --- HANDLE DELETE USER ---
  const handleDelete = async (id: string) => {
      try {
        const res = await fetch(`/api/admin/users?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchUsers();
          setDeleteSuccess(true); // TRIGGER POPUP SUKSES HAPUS
        }
      } catch (error) {
        alert("Gagal hapus");
      }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* --- POP-UP SUKSES DELETE (BARU) --- */}
      <Dialog open={deleteSuccess} onOpenChange={setDeleteSuccess}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Berhasil Dihapus!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                    Data user telah dihapus permanen dari sistem.
                </p>
                <Button 
                    onClick={() => setDeleteSuccess(false)}
                    className="mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full rounded-xl"
                >
                    Tutup
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manajemen Pengguna</h1>
          <p className="text-slate-500 dark:text-slate-400">Tambah admin baru atau kelola akun anak magang.</p>
        </div>
        
        {/* --- DIALOG TAMBAH USER --- */}
        <Dialog open={openAdd} onOpenChange={(v) => {setOpenAdd(v); if(!v) setAddSuccess(false); if(!v) resetForm();}}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white transition-all">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          
          <DialogContent className={`${addSuccess ? "sm:max-w-[400px]" : "sm:max-w-[500px]"} bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden gap-0 transition-all duration-300 rounded-2xl`}>
            {addSuccess ? (
                // SUKSES VIEW ADD
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95">
                    <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Berhasil Dibuat!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Data login sudah siap digunakan.</p>
                    <Button 
                        onClick={() => setOpenAdd(false)}
                        className="mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full rounded-xl"
                    >
                        Tutup
                    </Button>
                </div>
            ) : (
                // FORM VIEW ADD (Sama kayak sebelumnya)
                <>
                    <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3 text-xl">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Tambah User Baru
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400">
                                Isi formulir di bawah untuk mendaftarkan akun baru.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* ... Input Fields (User, Email, Pass, Role) copy dari sebelumnya ... */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Nama Lengkap</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="Masukkan Nama Lengkap" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input type="email" className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="Masukkan Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type={showPassword ? "text" : "password"} className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Konfirmasi</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type={showConfirmPassword ? "text" : "password"} className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="••••••" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Role Access</Label>
                            <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val as "ADMIN" | "INTERN"})}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11"><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectItem value="INTERN">Anak Magang (Intern)</SelectItem><SelectItem value="ADMIN">Admin / Pembimbing</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setOpenAdd(false)}>Batal</Button>
                        <Button onClick={handleAddUser} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan User"}</Button>
                    </div>
                </>
            )}
          </DialogContent>
        </Dialog>

        {/* --- DIALOG EDIT USER (UPDATED) --- */}
        <Dialog open={openEdit} onOpenChange={(v) => {setOpenEdit(v); if(!v) setEditSuccess(false);}}>
          <DialogContent className={`${editSuccess ? "sm:max-w-[400px]" : "sm:max-w-[500px]"} bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden gap-0 transition-all duration-300 rounded-2xl`}>
            {editSuccess ? (
                // SUKSES VIEW EDIT
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in zoom-in-95">
                    <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5 shadow-sm">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-bounce" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Berhasil!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Data user telah diperbarui.</p>
                    <Button 
                        onClick={() => setOpenEdit(false)}
                        className="mt-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 w-full rounded-xl"
                    >
                        Tutup
                    </Button>
                </div>
            ) : (
                // FORM VIEW EDIT
                <>
                    <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3 text-xl">
                                <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                    <Pencil className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                Edit Data User
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400">
                                Ubah informasi pengguna di sini. Password bersifat opsional.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Nama Lengkap</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Password Baru</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type={showPassword ? "text" : "password"} placeholder="Opsional" className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Konfirmasi</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="Opsional" className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Role Access</Label>
                            <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val as "ADMIN" | "INTERN"})}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-11"><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectItem value="INTERN">Anak Magang (Intern)</SelectItem><SelectItem value="ADMIN">Admin / Pembimbing</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setOpenEdit(false)}>Batal</Button>
                        <Button onClick={handleEditUser} disabled={isSaving} className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/20 px-6">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update User"}</Button>
                    </div>
                </>
            )}
          </DialogContent>
        </Dialog>

      </div>

      {/* Tabel Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Daftar Akun Terdaftar
                </CardTitle>
                <div className="relative max-w-sm w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                    placeholder="Cari nama atau email..."
                    className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="w-[50px] text-slate-700 dark:text-slate-300 pl-6">No</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">User Info</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Role</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Terdaftar Sejak</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Loader2 className="animate-spin h-5 w-5" /> Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                    Tidak ditemukan user dengan nama "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="text-slate-500 dark:text-slate-400 pl-6">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{user.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 gap-1 shadow-none">
                          <Shield className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 gap-1 shadow-none border border-slate-200 dark:border-slate-700">
                          <User className="h-3 w-3" /> Intern
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {/* TOMBOL EDIT */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-500 dark:hover:bg-yellow-900/20 transition-colors h-8 w-8"
                            onClick={() => openEditModal(user)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        {/* TOMBOL DELETE (ALERT DIALOG) */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors h-8 w-8"
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
                                        <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Konfirmasi Penghapusan</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="pl-[3.25rem] text-slate-500 dark:text-slate-400">
                                        Yakin ingin menghapus <b>{user.name}</b>? Data absensi dan akunnya akan hilang permanen.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-2">
                                    <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 border-0">Batal</AlertDialogCancel>
                                    <AlertDialogAction 
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Ya, Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="text-xs text-slate-400 dark:text-slate-600 text-center pt-10 border-t border-slate-100 dark:border-slate-800/50 mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}