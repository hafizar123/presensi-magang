"use client"; 

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CalendarDays, Briefcase, User, Search } from "lucide-react";
import ScheduleDialog from "@/components/ScheduleDialog";

interface InternsTableProps {
  interns: any[];
}

export default function InternsTableClient({ interns }: InternsTableProps) {
  const [search, setSearch] = useState("");

  const filteredInterns = interns.filter((intern) =>
    intern.name.toLowerCase().includes(search.toLowerCase()) ||
    intern.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER PAGE (Judul Halaman) */}
      <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EAE7DD]">Data Peserta Magang</h1>
          <p className="text-slate-500 dark:text-gray-400">Database lengkap seluruh anak magang.</p>
      </div>

      {/* CARD UTAMA */}
      <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] transition-colors overflow-hidden">
        
        {/* HEADER CARD + SEARCH (Disatuin Disini) */}
        <CardHeader className="border-b border-slate-100 dark:border-[#292524] pb-4 bg-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              
              {/* JUDUL "Master Data Magang" */}
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-[#EAE7DD] flex items-center gap-2">
                <User className="h-5 w-5 text-[#99775C]" />
                Master Data Magang
              </CardTitle>

              {/* SEARCH BAR (Pindah Kesini) */}
              <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                      placeholder="Cari nama / email..." 
                      className="pl-9 bg-white dark:bg-[#1c1917] border-slate-200 dark:border-[#292524] h-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
              </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#99775C]">
              <TableRow className="border-none hover:bg-[#99775C]">
                <TableHead className="w-[50px] text-white font-semibold pl-6">No</TableHead>
                <TableHead className="text-white font-semibold">Nama Lengkap</TableHead>
                <TableHead className="text-white font-semibold">Divisi/Posisi</TableHead>
                <TableHead className="text-white font-semibold">Durasi Magang</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-right text-white font-semibold pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterns.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 dark:text-gray-400">
                        {interns.length === 0 ? "Belum ada data peserta magang." : `Tidak ditemukan "${search}".`}
                    </TableCell>
                </TableRow>
              ) : (
                filteredInterns.map((intern, i) => (
                    <TableRow key={intern.id} className="border-b border-slate-100 dark:border-[#292524] hover:bg-slate-50 dark:hover:bg-[#292524] transition-colors">
                    <TableCell className="text-slate-500 dark:text-gray-400 pl-6">{i + 1}</TableCell>
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span className="text-slate-900 dark:text-[#EAE7DD]">{intern.name}</span>
                            <span className="text-xs text-slate-500 dark:text-gray-500">{intern.email}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm">
                            <Briefcase className="h-3 w-3 text-[#99775C]" />
                            <span className="italic">-</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        {intern.internProfile ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-[#EAE7DD] bg-slate-100 dark:bg-[#292524] px-2 py-1 rounded w-fit">
                            <CalendarDays className="h-3 w-3 text-[#99775C]" />
                            {new Date(intern.internProfile.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - 
                            {new Date(intern.internProfile.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">-</span>
                        )}
                    </TableCell>
                    <TableCell>
                        {intern.internProfile ? (
                            <Badge className="bg-green-100 text-green-700 border-none dark:bg-green-900/30 dark:text-green-400">
                                Aktif
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50">
                                Pending
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                        <ScheduleDialog user={intern} />
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-slate-400 dark:text-gray-600 text-center pt-10 border-t border-slate-100 dark:border-[#292524] mt-10">
        Copyright © 2026 Dinas Pendidikan Pemuda dan Olahraga DIY, Code by Magang Informatika 2023 UPNVYK
      </div>
    </div>
  );
}