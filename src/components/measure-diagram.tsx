"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SIZE_CHART } from "@/lib/products";

// The regular tee, drawn flat from the front, with the three measurements of the size chart over it.
// Coordinates are in the drawing's own units (600 × 640), so the lines sit on the seams at any size.
const W = 600;
const H = 640;
// Set-in sleeves, the shoulder seam on the shoulder point, a straight body: the Remix regular cut.
const TEE = "M244 34 Q300 74 356 34 L436 58 Q470 70 490 112 L516 176 L458 204 L424 160 L424 606 Q300 616 176 606 L176 160 L142 204 L84 176 L110 112 Q130 70 164 58 Z";
const COLLAR = "M244 34 Q300 74 356 34 M232 38 Q300 92 368 38";
const SEAMS = "M164 58 Q178 110 176 160 M436 58 Q422 110 424 160 M102 150 L148 186 M498 150 L452 186 M178 590 Q300 600 422 590";
const LINES = {
  busto: { d: "M176 196H424", ticks: "M176 180v32M424 180v32", label: { x: 300, y: 170 }, name: "Tórax" },
  barra: { d: "M176 566H424", ticks: "M176 550v32M424 550v32", label: { x: 330, y: 540 }, name: "Barra" },
  comprimento: { d: "M226 40V606", ticks: "M210 40h32M210 606h32", label: { x: 226, y: 400 }, name: "Comprimento" },
} as const;

const draw = (delay: number) => ({ initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true }, transition: { pathLength: { duration: 1.2, ease: "easeInOut" as const, delay }, opacity: { duration: 0.2, delay } } });
const cm = (value: number) => String(value).replace(".", ",");

// Pass `size` to drive it from outside (it then shows no size buttons of its own).
export function MeasureDiagram({ className = "", size: controlled }: { className?: string; size?: string }) {
  const [picked, setSize] = useState("M");
  const size = controlled ?? picked;
  const row = SIZE_CHART.find((item) => item.size === size) ?? SIZE_CHART[1] ?? SIZE_CHART[0];
  const values = { busto: cm(row.largura), barra: cm(row.barra ?? row.largura), comprimento: cm(row.comprimento) };

  return (
    <div className={className}>
      <div className="relative mx-auto w-full max-w-[30rem]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full drop-shadow-[0_34px_30px_rgba(10,14,22,.35)]" fill="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Camiseta regular Meranno de frente, com as medidas de tórax, barra e comprimento">
          <path d={TEE} fill="#efe9dc" stroke="#d9d0bd" strokeWidth={3} />
          <path d={COLLAR} stroke="#cfc5b0" strokeWidth={3} />
          <path d={SEAMS} stroke="#ddd4c2" strokeWidth={2} strokeDasharray="5 7" />
          {(Object.keys(LINES) as (keyof typeof LINES)[]).map((key, index) => <g key={key}>
            <motion.path {...draw(0.3 + index * 0.35)} d={LINES[key].d} stroke="var(--sol-1)" strokeWidth={3.5} strokeDasharray="2 10" />
            <motion.path {...draw(0.2 + index * 0.35)} d={LINES[key].ticks} stroke="var(--sol-1)" strokeWidth={3.5} />
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
      {!controlled && <><div className="mt-6 flex items-center justify-center gap-2" role="group" aria-label="Escolha um tamanho para ver as medidas">
        {SIZE_CHART.map((item) => <button key={item.size} type="button" onClick={() => setSize(item.size)} aria-pressed={item.size === size} className={`sans h-11 w-11 rounded-full text-sm transition-colors duration-300 ${item.size === size ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--ink)]/25 bg-[var(--paper)]/70 hover:border-[var(--ink)]"}`}>{item.size}</button>)}
      </div>
      <p className="sans mt-3 text-center text-[13px] text-[var(--muted)]">Medidas da peça, com ela estendida — toque num tamanho.</p></>}
    </div>
  );
}
