"use client";

import { motion, useReducedMotion } from "motion/react";

// Drawings lifted from our own prints. The two ink engravings are alpha masks, so they take any colour;
// the orange branch keeps its own painted colours.
const ART = {
  barco: { src: "/imagens/merano-assets/ilustracoes/barco.webp", width: 836, height: 522, ink: true, alt: "Barco de pesca em mar calmo, desenho da estampa Mares tranquilos" },
  cafe: { src: "/imagens/merano-assets/ilustracoes/cafe.webp", width: 772, height: 965, ink: true, alt: "Fachada de café com mesa na calçada, desenho da estampa Café" },
  laranjeira: { src: "/imagens/merano-assets/ilustracoes/laranjeira.webp", width: 890, height: 944, ink: false, alt: "Ramo de laranjeira em flor, da estampa Verão em boa companhia" },
} as const;

export type IllustrationName = keyof typeof ART;

// Unveils from the bottom up the first time it scrolls into view, like ink settling on paper.
export function Illustration({ name, className = "", color = "var(--mar-fundo)", decorative = true, delay = 0 }: { name: IllustrationName; className?: string; color?: string; decorative?: boolean; delay?: number }) {
  const art = ART[name];
  const reduce = useReducedMotion();
  const reveal = reduce ? {} : { initial: { clipPath: "inset(100% 0 0 0)", opacity: 0.4 }, whileInView: { clipPath: "inset(0% 0 0 0)", opacity: 1 }, viewport: { once: true, margin: "-40px" }, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] as const, delay } };
  const label = decorative ? { "aria-hidden": true } : { role: "img", "aria-label": art.alt };

  if (art.ink) return <motion.span {...reveal} {...label} className={`block ${className}`} style={{ aspectRatio: `${art.width} / ${art.height}`, backgroundColor: color, WebkitMaskImage: `url(${art.src})`, maskImage: `url(${art.src})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} />;
  return <motion.span {...reveal} {...label} className={`block ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element -- transparent cutout with its own colours */}
    <img src={art.src} alt="" width={art.width} height={art.height} loading="lazy" className="h-auto w-full drop-shadow-[0_18px_20px_rgba(32,28,23,.18)]" />
  </motion.span>;
}
