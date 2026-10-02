"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SIZE_CHART } from "@/lib/products";
import { FRONT_CUTOUT } from "@/lib/shirt-stories";

// Our front shirt with the three measurements of the size chart drawn over it.
// Coordinates are in the cutout's own pixels (1200 × 1180), so the lines sit on the seams at any size.
const W = 1200;
const H = 1180;
const LINES = {
  ombro: { d: "M192 205H1008", ticks: "M192 180v50M1008 180v50", label: { x: 600, y: 165 }, name: "Ombro a ombro" },
  busto: { d: "M220 712H978", ticks: "M220 687v50M978 687v50", label: { x: 600, y: 672 }, name: "Busto (largura)" },
  comprimento: { d: "M330 60V1168", ticks: "M305 60h50M305 1168h50", label: { x: 330, y: 930 }, name: "Comprimento" },
} as const;

const draw = (delay: number) => ({ initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true }, transition: { pathLength: { duration: 1.2, ease: "easeInOut" as const, delay }, opacity: { duration: 0.2, delay } } });

export function MeasureDiagram({ className = "" }: { className?: string }) {
  const [size, setSize] = useState("M");
  const row = SIZE_CHART.find((item) => item.size === size) ?? SIZE_CHART[2];
  const values = { ombro: row.ombro, busto: row.largura, comprimento: row.comprimento };
  const { src, small, large } = FRONT_CUTOUT;

  return (
    <div className={className}>
      <div className="relative mx-auto w-full max-w-[34rem]">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renders of the AI-upscaled cutout */}
        <img src={`${src}-${small}.webp`} srcSet={`${src}-${small}.webp ${small}w, ${src}-${large}.webp ${large}w`} sizes="(min-width: 768px) 34rem, 90vw" width={W} height={H} alt="Camiseta Merano de frente, com as medidas de ombro a ombro, busto e comprimento" className="h-auto w-full drop-shadow-[0_40px_36px_rgba(32,28,23,.22)]" />
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round" aria-hidden>
          {(Object.keys(LINES) as (keyof typeof LINES)[]).map((key, index) => <g key={key}>
            <motion.path {...draw(0.3 + index * 0.35)} d={LINES[key].d} stroke="var(--sol-1)" strokeWidth={5} strokeDasharray="2 16" />
            <motion.path {...draw(0.2 + index * 0.35)} d={LINES[key].ticks} stroke="var(--sol-1)" strokeWidth={5} />
          </g>)}
        </svg>
        {(Object.keys(LINES) as (keyof typeof LINES)[]).map((key, index) => {
          const { label, name } = LINES[key];
          return <motion.div key={key} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 + index * 0.35 }} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(label.x / W) * 100}%`, top: `${(label.y / H) * 100}%` }}>
            <span className="sans flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-[12px] text-[var(--paper)] shadow-[0_8px_20px_-10px_rgba(25,35,30,.7)] md:text-[13px]">
              {name}
              <AnimatePresence mode="wait" initial={false}>
                <motion.strong key={`${key}-${size}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="font-semibold text-[var(--sol-2)]">{values[key]} cm</motion.strong>
              </AnimatePresence>
            </span>
          </motion.div>;
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2" role="group" aria-label="Escolha um tamanho para ver as medidas">
        {SIZE_CHART.map((item) => <button key={item.size} type="button" onClick={() => setSize(item.size)} aria-pressed={item.size === size} className={`sans h-11 w-11 rounded-full text-sm transition-colors duration-300 ${item.size === size ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--ink)]/25 bg-[var(--paper)]/70 hover:border-[var(--ink)]"}`}>{item.size}</button>)}
      </div>
      <p className="sans mt-3 text-center text-[13px] text-[var(--muted)]">Medidas da peça, com ela estendida — toque num tamanho.</p>
    </div>
  );
}
