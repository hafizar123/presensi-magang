"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center" // Posisi iOS banget
      richColors={false} // Kita custom warna sendiri
      
      // Ikon kita set manual biar ukurannya pas & warnanya tajem
      icons={{
        success: <CircleCheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
        info: <InfoIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
        warning: <TriangleAlertIcon className="h-5 w-5 text-amber-500" />,
        error: <OctagonXIcon className="h-5 w-5 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="h-5 w-5 animate-spin text-slate-500" />,
      }}

      toastOptions={{
        unstyled: false, // Biar layout dasar tetep rapi, kita cuma override stylenya
        classNames: {
          toast: `
            group toast w-full font-sans
            
            /* 1. Background & Blur */
            /* LIGHT MODE: Putih 85% (Biar kebaca di background putih) + Blur Tebel */
            !bg-white/30
            
            /* DARK MODE: Hitam 75% + Blur Tebel */
            dark:!bg-[#1c1c1e]/80
            
            /* EFEK KACA */
            !backdrop-blur-xl 
            !backdrop-saturate-150
            
            /* 2. Border & Shadow */
            !border !border-black/5 dark:!border-white/10
            !shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:!shadow-[0_4px_24px_rgba(0,0,0,0.2)]
            
            /* 3. Shape (Sesuai Request: Gak terlalu bulat) */
            !rounded-2xl
            !p-4 !gap-3
            
            /* 4. Text Color (Pasti Tegas) */
            !text-slate-900 dark:!text-slate-100
            
            /* Animasi Halus */
            transition-all duration-200 ease-out
            
            /* === WARNA STATUS (Strip Tipis di Kiri atau Tint) === */
            /* Kita kasih border kiri warna biar jelas ini Error/Success */
            data-[type=error]:!border-l-[6px] data-[type=error]:!border-l-red-500
            data-[type=success]:!border-l-[6px] data-[type=success]:!border-l-emerald-500
            data-[type=info]:!border-l-[6px] data-[type=info]:!border-l-sky-500
            data-[type=warning]:!border-l-[6px] data-[type=warning]:!border-l-amber-500
          `,
          
          /* Styling Judul & Deskripsi */
          title: "!text-[15px] !font-bold !tracking-tight !text-slate-900 dark:!text-white mb-1",
          description: "!text-[13px] !font-medium !text-slate-600 dark:!text-slate-400 !leading-snug",
          
          /* Tombol Action (Solid) */
          actionButton:
            "!bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 !font-bold !rounded-lg !px-4 !h-8 !text-xs hover:opacity-90 transition-opacity",
            
          /* Tombol Cancel */
          cancelButton:
            "!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 !rounded-lg !px-4 !h-8 !text-xs hover:!bg-slate-200 transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }