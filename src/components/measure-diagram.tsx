"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SIZE_CHART } from "@/lib/products";

// The regular tee, flat from the front (a cutout of the Personalizador's regular mockup), with only the centimetres of
// the size chart over it (owners' meeting, 2026-11-22: "camiseta em tamanho normal só com os centímetros").
// Coordinates are in the cutout's own pixels (735 × 894), so the lines sit on the garment at any size.
const W = 735;
const H = 894;
const LINES = {
  busto: { d: "M154 401H578", ticks: "M154 386v30M578 386v30", label: { x: 366, y: 372 }, name: "Tórax" },
  barra: { d: "M132 852H599", ticks: "M132 837v30M599 837v30", label: { x: 366, y: 823 }, name: "Barra" },
  comprimento: { d: "M236 22V888", ticks: "M221 22h30M221 888h30", label: { x: 236, y: 610 }, name: "Comprimento" },
} as const;

const draw = (delay: number) => ({ initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true }, transition: { pathLength: { duration: 1, ease: "easeInOut" as const, delay }, opacity: { duration: 0.2, delay } } });
const cm = (value: number) => String(value).replace(".", ",");

// Pass `size` to drive it from outside (it then shows no size buttons of its own).
export function MeasureDiagram({ className = "", size: controlled }: { className?: string; size?: string }) {
  const [picked, setSize] = useState("M");
  const size = controlled ?? picked;
  const row = SIZE_CHART.find((item) => item.size === size) ?? SIZE_CHART[1] ?? SIZE_CHART[0];
  const values = { busto: cm(row.largura), barra: cm(row.barra ?? row.largura), comprimento: cm(row.comprimento) };

  return (
    <div className={className}>
      <div className="relative mx-auto w-full max-w-[34rem]">
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent cutout drawn under the measurement lines */}
        <img src="/imagens/camiseta-regular-frente.webp" width={W} height={H} alt="Camiseta regular Meranno de frente, com as medidas de tórax, barra e comprimento" className="h-auto w-full drop-shadow-[0_30px_30px_rgba(0,0,0,.35)]" />
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round" aria-hidden>
          {(Object.keys(LINES) as (keyof typeof LINES)[]).map((key, index) => <g key={key}>
            <motion.path {...draw(0.3 + index * 0.3)} d={LINES[key].d} stroke="var(--vinho)" strokeWidth={4} strokeDasharray="3 12" />
            <motion.path {...draw(0.2 + index * 0.3)} d={LINES[key].ticks} stroke="var(--vinho)" strokeWidth={4} />
          </g>)}
        </svg>
        {(Object.keys(LINES) as (keyof typeof LINES)[]).map((key, index) => {
          const { label, name } = LINES[key];
          return <motion.div key={key} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.7 + index * 0.3 }} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(label.x / W) * 100}%`, top: `${(label.y / H) * 100}%` }}>
            <span className="sans flex items-center gap-2 whitespace-nowrap rounded-full bg-[#141110] px-3.5 py-1.5 text-[12px] text-[#F6F1E8] shadow-[0_8px_20px_-10px_rgba(0,0,0,.7)] md:text-[13px]">
              {name}
              <AnimatePresence mode="wait" initial={false}>
                <motion.strong key={`${key}-${size}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="font-semibold text-[var(--latao)]">{values[key]} cm</motion.strong>
              </AnimatePresence>
            </span>
          </motion.div>;
        })}
      </div>
      {!controlled && <><div className="mt-6 flex items-center justify-center gap-2" role="group" aria-label="Escolha um tamanho para ver as medidas">
        {SIZE_CHART.map((item) => <button key={item.size} type="button" onClick={() => setSize(item.size)} aria-pressed={item.size === size} className={`sans h-11 w-11 rounded-full text-sm transition-colors duration-300 ${item.size === size ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--ink)]/25 bg-[var(--paper)]/70 hover:border-[var(--ink)]"}`}>{item.size}</button>)}
      </div>
      <p className="sans mt-3 text-center text-[13px] text-[var(--muted)]">Medidas da peça, com ela estendida — toque num tamanho.</p></>}
    </div>
  );
}
