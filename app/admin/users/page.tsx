"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Loader2, UserPlus, Shield, User, Mail, Calendar } from "lucide-react";

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
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "INTERN",
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpenDialog(false);
        setFormData({ name: "", email: "", password: "", role: "INTERN" }); 
        fetchUsers(); 
        alert("User berhasil ditambah!");
      } else {
        alert("Gagal bro, cek email mungkin duplikat?");
      }
    } catch (error) {
      alert("Error server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin mau hapus user "${name}"? Data absennya bakal ilang juga lho!`)) {
      try {
        const res = await fetch(`/api/admin/users?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchUsers();
        }
      } catch (error) {
        alert("Gagal hapus");
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manajemen Pengguna</h1>
          <p className="text-slate-500 dark:text-slate-400">Tambah admin baru atau kelola akun anak magang.</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white transition-all">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Tambah Pengguna Baru
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      required 
                      className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      placeholder="Nama Lengkap" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      required 
                      type="email" 
                      className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      placeholder="email@dinas.go.id"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Password</Label>
                <Input 
                  required 
                  type="password" 
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Role (Jabatan)</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="INTERN" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800">Anak Magang (Intern)</SelectItem>
                    <SelectItem value="ADMIN" className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800">Admin / Pembimbing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSaving} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                      </>
                  ) : "Simpan User"}
                </Button>
              </DialogFooter>
            </form>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDelete(user.id, user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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