"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroVideo } from "@/components/hero-video";
import { HeroTextReveal } from "@/components/hero-text-reveal";
import { PillLink } from "@/components/ui/pill-link";

import type { Topo } from "@/lib/topo";

const MANCHETE = ["Feito para", "quem entende de", <span key="excl" className="hero-accent">exclusividade.</span>];

// The four sides of one shirt, crossfading like a slow turn on the table.
const GIRO = [
  "/imagens/merano-assets/produtos/who-cares-preto-verso.jpg",
  "/imagens/merano-assets/produtos/preta-vermelha-lado-esquerdo.jpg",
  "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg",
  "/imagens/merano-assets/produtos/preta-vermelha-lado-direito.jpg",
];


// Suit shapes drawn as paths (a text "♠" can turn into a coloured emoji on some phones).
const ESPADAS = "M50 4 C34 30 6 42 6 64 C6 80 22 89 36 84 C42 82 46 77 48 72 C47 82 43 90 33 96 L67 96 C57 90 53 82 52 72 C54 77 58 82 64 84 C78 89 94 80 94 64 C94 42 66 30 50 4 Z";
const COPAS = "M50 92 C30 74 6 58 6 34 C6 18 18 8 31 8 C40 8 46 13 50 21 C54 13 60 8 69 8 C82 8 94 18 94 34 C94 58 70 74 50 92 Z";
const OUROS = "M50 4 L88 50 L50 96 L12 50 Z";
const PAUS = "M50 6 C62 6 70 15 70 26 C70 33 67 38 63 42 C67 40 71 39 75 39 C86 39 94 48 94 59 C94 70 86 78 75 78 C66 78 58 72 55 63 C55 75 58 85 66 94 L34 94 C42 85 45 75 45 63 C42 72 34 78 25 78 C14 78 6 70 6 59 C6 48 14 39 25 39 C29 39 33 40 37 42 C33 38 30 33 30 26 C30 15 38 6 50 6 Z";
const NAIPES = [ESPADAS, COPAS, OUROS, PAUS];

function AsGigante() {
  return <svg aria-hidden viewBox="0 0 100 100" className="as-gigante pointer-events-none absolute -right-[22%] top-[10%] h-[78%] w-auto md:-right-[4%] md:top-[6%] md:h-[96%]">
    <path d={ESPADAS} pathLength={1} className="as-traco" fill="none" stroke="var(--latao)" strokeWidth={0.55} />
    <path d={ESPADAS} transform="translate(50 50) scale(.86) translate(-50 -50)" fill="none" stroke="var(--latao)" strokeOpacity={0.35} strokeWidth={0.4} />
  </svg>;
}

function NaipesNasOndas() {
  return <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[16%] h-[38%] md:top-[22%] md:h-[46%]">
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="ondas-latao absolute -left-[10%] h-full w-[120%]">
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-20 ${20 + i * 18} Q 30 ${8 + i * 18} 80 ${20 + i * 18} T 180 ${20 + i * 18} T 280 ${20 + i * 18} T 380 ${20 + i * 18} T 480 ${20 + i * 18}`} fill="none" stroke="var(--latao)" strokeWidth={1.1} vectorEffect="non-scaling-stroke" opacity={0.75} />)}
    </svg>
    {NAIPES.map((d, i) => <svg key={i} viewBox="0 0 100 100" className="boia absolute top-[18%] h-[14%] w-auto md:h-[12%]" style={{ left: `${14 + i * 20}%`, animationDelay: `-${i * 0.9}s` }}>
      <path d={d} fill="var(--latao-2, #D9BE85)" />
    </svg>)}
  </div>;
}

function Manchete() {
  return <div className="relative z-10 flex min-h-[88svh] flex-col justify-end pb-14 pt-24 md:min-h-screen md:justify-center md:pb-0">
    <div className="rule-latao mb-6 w-20" />
    <HeroTextReveal className="display max-w-3xl text-[clamp(2.9rem,8.5vw,6.8rem)]" lines={MANCHETE} />
    <div className="mt-9 flex flex-wrap gap-3"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink><PillLink href="/personalizar-estampa" variant="glass">Criar a minha</PillLink></div>
  </div>;
}

function Giro() {
  const [atual, setAtual] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setAtual((i) => (i + 1) % GIRO.length), 2600);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)] ring-1 ring-[var(--latao)]/40">
    {GIRO.map((src, i) => <Image key={src} src={src} alt={i === 0 ? "Camiseta Who cares preta" : ""} fill priority={i === 0} sizes="(min-width: 768px) 34vw, 80vw" className={`object-cover transition-opacity duration-700 ${i === atual ? "opacity-100" : "opacity-0"}`} />)}
  </div>;
}

export function HeroTopo({ topo }: { topo: Topo }) {
  if (topo === "as") return <section className="feltro relative overflow-hidden px-7 text-[var(--creme)] md:px-16"><AsGigante /><Manchete /></section>;
  if (topo === "naipes") return <section className="feltro relative overflow-hidden px-7 text-[var(--creme)] md:px-16"><NaipesNasOndas /><Manchete /></section>;
  if (topo === "mar-vinho") return <section className="relative overflow-hidden bg-[var(--vinho)] px-7 text-[var(--creme)] md:px-16">
    <div className="mar-vinho absolute inset-0"><HeroVideo src="/imagens/merano-assets/banner-mar-4.mp4" mobileSrc="/imagens/merano-assets/banner-mar-4-mobile.mp4" poster="/imagens/merano-assets/banner-mar-4-poster.jpg" /></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(36,10,16,.85),rgba(36,10,16,.15)_60%)]" />
    <Manchete />
  </section>;

  if (topo === "feltro") return <section className="feltro relative overflow-hidden px-7 text-[var(--creme)] md:px-16">
    <div className="relative z-10 flex min-h-[88svh] flex-col justify-center pt-20 md:min-h-screen">
      <div className="rule-latao mb-6 w-20" />
      <HeroTextReveal className="display max-w-4xl text-[clamp(3rem,9vw,7.5rem)]" lines={MANCHETE} />
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--creme)]/75">Camisetas feitas sob demanda, com a sua estampa ou a nossa.</p>
      <div className="mt-9 flex flex-wrap gap-3"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink><PillLink href="/personalizar-estampa" variant="glass">Criar a minha</PillLink></div>
    </div>
  </section>;

  if (topo === "lookbook") return <section className="relative overflow-hidden text-[var(--creme)]">
    <div className="relative min-h-[92svh] md:min-h-screen">
      <Image src="/imagens/merano-assets/lookbook/modelo-preta-vermelha.webp" alt="Modelo de costas vestindo a Who cares preta" fill priority sizes="100vw" className="object-cover object-[50%_20%]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(36,10,16,.92)_0%,rgba(36,10,16,.45)_38%,rgba(36,10,16,0)_65%)]" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-7 pb-12 md:px-16 md:pb-16">
        <HeroTextReveal className="display max-w-3xl text-[clamp(2.8rem,8vw,6.4rem)]" lines={MANCHETE} />
        <div className="mt-8"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink></div>
      </div>
    </div>
  </section>;

  if (topo === "vitrine") return <section className="feltro relative overflow-hidden px-7 text-[var(--creme)] md:px-16">
    <div className="relative z-10 grid min-h-[92svh] items-center gap-10 pb-12 pt-24 md:min-h-screen md:grid-cols-[1.1fr_.9fr] md:pt-20">
      <div>
        <div className="rule-latao mb-6 w-20" />
        <HeroTextReveal className="display max-w-3xl text-[clamp(2.8rem,7.5vw,6.4rem)]" lines={MANCHETE} />
        <div className="mt-9"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink></div>
      </div>
      <div className="mx-auto w-[78%] max-w-[420px] md:w-full"><Giro /></div>
    </div>
  </section>;

  return <section className="relative overflow-hidden px-7 py-10 text-white md:px-16 md:py-16">
    <HeroVideo src="/imagens/merano-assets/banner-mar-4.mp4" mobileSrc="/imagens/merano-assets/banner-mar-4-mobile.mp4" poster="/imagens/merano-assets/banner-mar-4-poster.jpg" />
    {/* Shade weighted to the side the headline sits on, so the type reads over bright surf without dimming the whole sea. */}
    <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(36,10,16,.66)_0%,rgba(36,10,16,.36)_42%,rgba(36,10,16,.1)_72%)]" />
    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(36,10,16,.4)] to-transparent" />
    <div className="relative z-10 flex min-h-screen flex-col justify-center">
      <div className="max-w-3xl"><HeroTextReveal className="display max-w-3xl text-[clamp(2.8rem,7vw,6.4rem)] [text-shadow:0_2px_36px_rgba(4,18,24,.35)]" lines={MANCHETE} /></div>
      <div className="mt-10"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink></div>
    </div>
  </section>;
}
