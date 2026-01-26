"use client";

import { useEffect, useState } from "react";

export default function RealtimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(/\./g, ":");

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* JAM: Tetap Putih biar kontras di BG Gelap */}
      <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-white leading-none drop-shadow-sm">
        {formattedTime}
      </div>
      
      {/* TANGGAL: Pakai warna NARVIK (#EAE7DD) biar nyatu sama tema Earth Tone */}
      <p className="text-sm md:text-base font-medium text-[#EAE7DD] mt-3 uppercase tracking-widest opacity-90">
        {formattedDate}
      </p>
    </div>
  );
}