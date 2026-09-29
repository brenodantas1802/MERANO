"use client";

import { motion } from "motion/react";

// Hand-drawn line illustrations that sketch themselves in when scrolled into view.
const DRAWINGS = {
  sun: { viewBox: "0 0 60 60", paths: ["M30 19.5c6.2-.3 11.2 4.4 11.5 10.4.3 6.3-4.6 11.2-10.8 11.6-6.2.3-11.4-4.4-11.7-10.6C18.7 24.8 23.7 19.8 30 19.5Z", "M30 4.5v7", "M30 48.5v7", "M4.5 30.5h7", "M48.5 29.5h7", "M11.5 11l5 5", "M43.5 43.5l5 5", "M48.5 11.5l-5 4.5", "M16 44l-4.5 4.5"] },
  wave: { viewBox: "0 0 120 24", paths: ["M2 14c6.5-8 13-8 19.5 0s13 8 19.5 0 13-8 19.5 0 13 8 19.5 0 13-8 19.5 0 11 7 17 1"] },
  boat: { viewBox: "0 0 70 60", paths: ["M10 44.5c11 5.5 38 5.5 50 .5", "M35 43V7", "M34 9.5c-8.5 10-13.5 20.5-15.5 29h15.5", "M37 13.5c6.5 8 9.5 16 10.5 25H37", "M4 54c6-3 11-3 16 0s11 3 16 0 11-3 16 0 10 3 14 0"] },
  branch: { viewBox: "0 0 70 60", paths: ["M3 50c15-5 28-17 38-36", "M17 43c-3-8 2-14 10-15-1 8-4 13-10 15Z", "M29 31c-4-7-1-14 7-17 1 8-2 14-7 17Z", "M26 44c6-6 13-6 18-2-5 5-12 6-18 2Z", "M50 33c5.5 0 9.5 4 9.5 9s-4 9-9.5 9-9.5-4-9.5-9 4-9 9.5-9Z", "M47 42c.5-2 2-3.5 4-3.5"] },
  arrow: { viewBox: "0 0 60 40", paths: ["M3 32c10-2 19-10 17-19-1.5-5.5-8.5-5-8.5 1 0 9.5 14.5 15 30.5 7.5", "M36.5 17.5l6 4-4.5 5.5"] },
} as const;

export type DoodleName = keyof typeof DRAWINGS;

export function Doodle({ name, className, delay = 0 }: { name: DoodleName; className?: string; delay?: number }) {
  const drawing = DRAWINGS[name];
  return <svg viewBox={drawing.viewBox} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {drawing.paths.map((d, index) => <motion.path key={index} d={d} initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ pathLength: { duration: 1.1, ease: "easeInOut", delay: delay + index * 0.12 }, opacity: { duration: 0.2, delay: delay + index * 0.12 } }} />)}
  </svg>;
}

export function Marquee({ items }: { items: string[] }) {
  const row = <div className="flex shrink-0 items-center gap-10 pr-10">{items.map((item) => <span key={item} className="flex items-center gap-10"><span className="display whitespace-nowrap text-3xl italic md:text-5xl">{item}</span><Doodle name="sun" className="h-7 w-7 shrink-0 text-[var(--sol-1)] md:h-9 md:w-9" /></span>)}</div>;
  return <div className="overflow-hidden border-y border-[var(--ink)] bg-[var(--paper)] py-5 md:py-7" aria-label={items.join(", ")}>
    <div className="marquee flex w-max">{row}{row}</div>
  </div>;
}
