"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Loader2, UserPlus, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";

// Komponen UI Shadcn
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

// Tipe Data User
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
  
  // State buat Form Add User
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "INTERN",
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Data User saat pertama buka
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

  // 2. Fungsi Add User
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
        setFormData({ name: "", email: "", password: "", role: "INTERN" }); // Reset form
        fetchUsers(); // Refresh tabel
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

  // 3. Fungsi Delete User
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin mau hapus user "${name}"? Data absennya bakal ilang juga lho!`)) {
      try {
        const res = await fetch(`/api/admin/users?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchUsers(); // Refresh tabel
        }
      } catch (error) {
        alert("Gagal hapus");
      }
    }
  };

  // 4. Logic Search (Filter user yang namanya cocok)
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Pengguna</h1>
          <p className="text-slate-500">Tambah admin baru atau kelola akun anak magang.</p>
        </div>
        
        {/* Tombol Add User (Trigger Modal) */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input 
                  required 
                  placeholder="Masukkan Nama Lengkap" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  required 
                  type="email" 
                  placeholder="Masukkan Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  required 
                  type="password" 
                  placeholder="Masukkan Password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Role (Jabatan)</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERN">Anak Magang (Intern)</SelectItem>
                    <SelectItem value="ADMIN">Admin / Pembimbing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSaving} className="w-full mt-4">
                  {isSaving ? "Menyimpan..." : "Simpan User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Card Utama */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Daftar Akun Terdaftar</CardTitle>
          
          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama atau email..."
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>User Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Terdaftar Sejak</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500">
                      <Loader2 className="animate-spin h-5 w-5" /> Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Tidak ditemukan user dengan nama "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-slate-500">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1">
                          <Shield className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 gap-1">
                          <User className="h-3 w-3" /> Intern
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
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
    </div>
  );
}