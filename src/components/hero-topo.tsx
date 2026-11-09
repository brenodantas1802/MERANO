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
