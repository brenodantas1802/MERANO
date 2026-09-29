"use client";

import { motion } from "motion/react";

const draw = (delay: number) => ({ initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true }, transition: { pathLength: { duration: 1.4, ease: "easeInOut" as const, delay }, opacity: { duration: 0.2, delay } } });
const fade = (delay: number) => ({ initial: { opacity: 0, y: 6 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay } });

// Hand-drawn tee with the three measurements the size chart uses, sketched in on scroll.
export function MeasureDiagram({ className }: { className?: string }) {
  return <svg viewBox="0 0 420 420" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} aria-label="Onde medir: ombro a ombro, largura do busto e comprimento">
    <motion.path {...draw(0)} stroke="var(--ink)" strokeWidth={2} d="M150 62c14 16 34 22 60 22s46-6 60-22l58 22c14 6 26 18 34 34l24 46-58 24-22-40v208c0 8-6 13-14 13H138c-8 0-14-5-14-13V148l-22 40-58-24 24-46c8-16 20-28 34-34l58-22Z" />
    <motion.path {...draw(0.4)} stroke="var(--ink)" strokeWidth={1.4} d="M170 70c10 14 24 20 40 20s30-6 40-20" />
    <motion.path {...draw(0.9)} stroke="var(--sol-1)" strokeWidth={1.8} strokeDasharray="1 7" d="M150 104h120" />
    <motion.path {...draw(1.2)} stroke="var(--sol-1)" strokeWidth={1.8} strokeDasharray="1 7" d="M126 196h168" />
    <motion.path {...draw(1.5)} stroke="var(--sol-1)" strokeWidth={1.8} strokeDasharray="1 7" d="M322 86v280" />
    <motion.path {...draw(1.1)} stroke="var(--sol-1)" strokeWidth={1.8} d="M150 98v12M270 98v12M126 190v12M294 190v12M316 86h12M316 366h12" />
    <motion.text {...fade(1.6)} x="210" y="96" textAnchor="middle" className="script" fontSize="19" fill="var(--terra)">ombro a ombro</motion.text>
    <motion.text {...fade(1.9)} x="210" y="228" textAnchor="middle" className="script" fontSize="19" fill="var(--terra)">busto</motion.text>
    <motion.text {...fade(2.2)} x="352" y="232" textAnchor="middle" className="script" fontSize="19" fill="var(--terra)" transform="rotate(90 352 232)">comprimento</motion.text>
  </svg>;
}
