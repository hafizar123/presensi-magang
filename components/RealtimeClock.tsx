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
      <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-white leading-none">
        {formattedTime}
      </div>
      {/* UPDATE WARNA TEKS TANGGAL */}
      <p className="text-sm md:text-base font-medium text-red-100/80 mt-3 uppercase tracking-wide">
        {formattedDate}
      </p>
    </div>
  );
}