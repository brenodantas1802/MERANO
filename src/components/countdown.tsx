"use client";

import { useEffect, useState } from "react";

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(new Date(target))), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units: { label: string; value: number }[] = remaining
    ? [
        { label: "Dias", value: remaining.dias },
        { label: "Horas", value: remaining.horas },
        { label: "Min", value: remaining.minutos },
        { label: "Seg", value: remaining.segundos },
      ]
    : [
        { label: "Dias", value: 0 },
        { label: "Horas", value: 0 },
        { label: "Min", value: 0 },
        { label: "Seg", value: 0 },
      ];

  return (
    <div className="grid grid-cols-4 gap-3 md:gap-6">
      {units.map((unit) => (
        <div key={unit.label} className="border border-[var(--line)] px-3 py-6 text-center md:px-6 md:py-10">
          <span className="display block text-4xl tabular-nums md:text-6xl">{String(unit.value).padStart(2, "0")}</span>
          <span className="sans mt-2 block text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
