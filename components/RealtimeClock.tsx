"use client";

import { useEffect, useState } from "react";

export default function RealtimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Timer tetep per detik biar menitnya ganti pas di detik ke-00
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Pastiin format 24 jam (misal 13:00)
    // Detik udah gua buang
  }).replace(/\./g, ":"); // Ganti titik jadi titik dua biar ganteng (opsional, standar indo pake titik soalnya)

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Gua apus 'tabular-nums' karena udah gada detik yang gerak2.
         Size gua gedein dikit jadi text-7xl biar makin gagah karena angkanya lebih dikit.
      */}
      <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-white leading-none">
        {formattedTime}
      </div>
      <p className="text-sm md:text-base font-medium text-green-100/80 mt-3 uppercase tracking-wide">
        {formattedDate}
      </p>
    </div>
  );
}