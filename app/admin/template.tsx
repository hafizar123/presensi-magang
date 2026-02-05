"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    // Kita pake div biasa dengan class Tailwind buat animasi "Masuk"
    // animate-in: Memicu animasi
    // fade-in: Dari transparan ke jelas
    // slide-in-from-bottom-4: Dari bawah naik dikit (1rem)
    // duration-500: Durasinya 0.5 detik (pas, ga kecepetan ga lambat)
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {children}
    </div>
  );
}