"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="bg-transparent border-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* Ikon Matahari: Muncul pas Light, Ilang pas Dark */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-700" />
      
      {/* Ikon Bulan: Ilang pas Light, Muncul pas Dark */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-200" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}