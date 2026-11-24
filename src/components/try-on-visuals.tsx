"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { products } from "@/lib/products";
import { SHIRT_STORIES, thumbOf } from "@/lib/shirt-stories";

const EASE = [0.22, 1, 0.36, 1] as const;
// The lookbook model as photographed, and the same photo dressed in each of our shirts by the site's own try-on
// (2026-11-23), each laid over the original's frame so the before/after split lines up to the pixel.
const MODEL = "/imagens/merano-assets/provador/modelo.webp";
export const MODELO_VESTIDO = ["amore-black", "amore-white", "riviera", "arancia", "why-not"];
const vestido = (id: string) => `/imagens/merano-assets/provador/modelo-${id}.webp`;
const nome = (id: string) => products.find((product) => product.id === id)?.name ?? "";
const FAN = ["amore-black", "arancia", "why-not"].map((id) => SHIRT_STORIES.find((story) => story.id === id)!);

// Three of our shirts fanned out like cards in a hand.
export function ShirtFan({ size = 56 }: { size?: number }) {
  return <span className="relative inline-flex shrink-0 items-center" style={{ width: size * 1.9, height: size }} aria-hidden>
    {FAN.map((story, index) => (
      // eslint-disable-next-line @next/next/no-img-element -- 200px thumbnails
      <img key={story.id} src={thumbOf(story)} alt="" width={200} height={200} className="absolute top-0 h-full w-auto drop-shadow-[0_8px_10px_rgba(32,28,23,.25)] transition-transform duration-500 group-hover:-translate-y-1" style={{ left: index * size * 0.45, rotate: `${(index - 1) * 12}deg`, zIndex: index === 1 ? 2 : 1 }} />
    ))}
  </span>;
}

// The model split down the middle: as photographed (in grey) and wearing our shirt. With several shirts the right half
// goes through them in turn (with reduced motion the first one stays); `rotulo` names the shirt shown, on a white
// written as a colour because the dark theme dims bg-white/90 (the label sits on the photo in both themes).
export function BeforeAfter({ className = "", vestidos = ["amore-black"], rotulo = false }: { className?: string; vestidos?: string[]; rotulo?: boolean }) {
  const [vez, setVez] = useState(0);
  const parado = useReducedMotion();
  const atual = vestidos[vez % vestidos.length];
  useEffect(() => {
    if (vestidos.length < 2 || parado) return;
    const timer = window.setInterval(() => setVez((value) => value + 1), 2800);
    return () => window.clearInterval(timer);
  }, [vestidos.length, parado]);
  // The next shirt loads while this one is on show, so the change is a fade and never a blank half.
  useEffect(() => {
    if (vestidos.length > 1) new Image().src = vestido(vestidos[(vez + 1) % vestidos.length]);
  }, [vez, vestidos]);

  return <span className={`relative block overflow-hidden ${className}`} aria-hidden>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={MODEL} alt="" className="absolute inset-0 h-full w-full object-cover grayscale" />
    <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.img key={atual} src={vestido(atual)} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }} className="absolute inset-y-0 right-0 h-full w-[200%] max-w-none object-cover" />
      </AnimatePresence>
    </span>
    <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow" />
    <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] text-[#141110] shadow-md">↔</span>
    {rotulo && <AnimatePresence mode="wait" initial={false}>
      <motion.span key={atual} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.35, ease: EASE }} className="sans absolute bottom-3 right-3 rounded-full bg-[rgba(255,255,255,.9)] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-[#141110] shadow">{nome(atual)}</motion.span>
    </AnimatePresence>}
  </span>;
}

function UploadPreview() {
  return <span className="relative block h-full overflow-hidden rounded-xl">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={MODEL} alt="" className="h-full w-full object-cover object-top" />
    <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--ink)] shadow"><ImagePlus size={15} strokeWidth={1.6} /></span>
  </span>;
}

const STEPS = [
  { title: "Escolha a estampa", visual: <span className="flex h-full items-center justify-center pr-3"><ShirtFan size={88} /></span> },
  { title: "Envie sua foto", visual: <UploadPreview /> },
  { title: "Compare antes e depois", visual: <BeforeAfter className="h-full rounded-xl" /> },
];

// Hero row: the three steps as small cards with real pieces instead of icons.
export function TryOnSteps() {
  return <ol className="grid max-w-xl grid-cols-3 gap-3 md:gap-5">
    {STEPS.map((step, index) => <motion.li key={step.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 + index * 0.12 }} className="group">
      <div className="aspect-[4/5] rounded-2xl bg-[var(--paper)]/75 p-2 shadow-[0_20px_40px_-28px_rgba(32,28,23,.55)] ring-1 ring-white/70 backdrop-blur transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1deg]">{step.visual}</div>
      <p className="mt-3 text-[15px] leading-tight md:text-lg"><span className="display mr-1.5 text-[var(--sol-1)]">{index + 1}</span>{step.title}</p>
    </motion.li>)}
  </ol>;
}

// Disclosure in the same shape as the shirt chooser: a short "how it works" that opens under the arrow.
export function HowItWorks() {
  const [open, setOpen] = useState(false);
  return <div className="mb-10">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between rounded-[1.75rem] bg-[var(--mar-fundo)] px-6 py-5 text-left text-[var(--paper)]">
      <span><span className="display block text-2xl">Como funciona</span><span className="sans text-[12px] text-[var(--paper)]/70">3 passos, menos de um minuto</span></span>
      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--paper)]/10"><ChevronDown size={18} strokeWidth={1.6} /></motion.span>
    </button>
    <AnimatePresence initial={false}>
      {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
        <ol className="mt-3 space-y-3 rounded-[1.75rem] bg-[var(--superficie)] p-5 shadow-[0_18px_40px_-30px_rgba(32,28,23,.55)]">
          {[
            ["Escolha a estampa", "Toque em “Escolher camiseta” e escolha a peça que você quer provar."],
            ["Envie uma foto sua", "De preferência de costas, que é onde fica a estampa — corpo inteiro ou da cintura pra cima, com boa luz e sem filtro."],
            ["Gere e compare", "Toque em “Gerar provador virtual”. Em instantes você vê a foto original e você vestindo a Meranno, lado a lado."],
          ].map(([title, text], index) => <li key={title} className="flex gap-4">
            <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sol-1)] text-lg text-white">{index + 1}</span>
            <span><span className="block text-lg leading-tight">{title}</span><span className="sans mt-1 block text-[13px] leading-snug text-[var(--muted)]">{text}</span></span>
          </li>)}
        </ol>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
