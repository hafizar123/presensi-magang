"use client";

import { useEffect, useState } from "react";

export default function RealtimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update jam tiap 1 detik
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
        {time.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h2>
      <p className="text-slate-500 font-medium mt-1">
        {time.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}