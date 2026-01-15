"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Home, History, FileText } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export default function UserHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-slate-100">
        <Home className="text-blue-600 w-5 h-5" />
        <span>Magang<span className="text-blue-600">App</span></span>
      </div>

      {/* Menu Tengah */}
      <nav className="hidden md:flex gap-6">
        <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">Dashboard</Link>
        <Link href="/riwayat" className="text-sm font-medium hover:text-blue-600 transition-colors">Riwayat</Link>
        <Link href="/izin" className="text-sm font-medium hover:text-blue-600 transition-colors">Izin</Link>
      </nav>

      {/* Kanan: Profil & Mode */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
                <p className="font-normal">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" /> Edit Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}