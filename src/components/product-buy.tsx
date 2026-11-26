"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useCart } from "./cart-provider";
import { ShareButton } from "./share-button";
import { useSizeRecommendation } from "@/lib/use-size-recommendation";
import { formatPrice, getProductPrice, type Product } from "@/lib/products";

// Swatch colours for the colour names used in the catalog.
const SWATCH: Record<string, string> = { Preto: "#1c1c1a", "Azul marinho": "#1f2b45", Natural: "#e9e2d4", Branco: "#f4f3ee" };
// Long enough to read "Adicionando…", short enough to feel instant.
const ADD_FEEDBACK_MS = 380;

export type Colorway = { id: string; color: string };
type State = "idle" | "adding" | "added";

function SizePills({ fits, size, recommended, onPick, small = false }: { fits: string[]; size: string | null; recommended: string | null; onPick: (value: string) => void; small?: boolean }) {
  // gap-1.5: the four sizes (P to GG) stay on one line in the narrow buy column of a 1024 px screen.
  return <div role="radiogroup" aria-label="Tamanho" className={`flex gap-1.5 ${small ? "flex-nowrap" : "flex-wrap"}`}>
    {fits.map((value) => {
      const active = size === value;
      return <button key={value} type="button" role="radio" aria-checked={active} onClick={() => onPick(value)} className={`press relative rounded-full text-[13px] font-medium ${small ? "h-11 min-w-11 px-2.5" : "h-11 min-w-11 px-3"} ${active ? "bg-[var(--vinho)] text-[var(--creme)]" : "text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(17,17,17,.18)] hover:shadow-[inset_0_0_0_1px_rgba(17,17,17,.6)]"}`}>
        {value}
        {value === recommended && <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--paper)] bg-[var(--sol-1)]" />}
      </button>;
    })}
  </div>;
}

// The buying column of the product page: colour (other colourways are their own pages), size pills and the buttons.
// On phones a frosted bar with size and "Adicionar ao carrinho" floats at the bottom whenever the main button is off screen.
export function ProductBuy({ product, colorways }: { product: Product; colorways: Colorway[] }) {
  const { recommendation } = useSizeRecommendation(product);
  const recommended = recommendation && product.fits.includes(recommendation.size) ? recommendation.size : null;
  const [chosen, setChosen] = useState<string | null>(null);
  const [missing, setMissing] = useState(0);
  const [state, setState] = useState<State>("idle");
  const { adicionar, openDrawer } = useCart();
  const size = chosen ?? recommended;
  const color = product.colors[0];
  const price = formatPrice(getProductPrice(product));
  const buyRef = useRef<HTMLDivElement>(null);
  const [buyOffScreen, setBuyOffScreen] = useState(false);
  // While someone types in a form further down (e.g. a review), the floating bar would cover it.
  const [typing, setTyping] = useState(false);
  // Phones: the bar waits until the page has scrolled a little. Right after the page opens, the name, the price and the
  // instalments sit just under the photo, and the bar would cover them (2026-11-24).
  const [rolou, setRolou] = useState(false);
  const barOn = buyOffScreen && !typing && rolou;

  useEffect(() => {
    const element = buyRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setBuyOffScreen(!entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > window.innerHeight * 0.3);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const isField = (target: EventTarget | null) => target instanceof HTMLElement && target.matches("input:not([type=checkbox]):not([type=radio]), textarea, select") && !buyRef.current?.contains(target);
    const onIn = (event: FocusEvent) => { if (isField(event.target)) setTyping(true); };
    const onOut = (event: FocusEvent) => { if (isField(event.target)) setTyping(false); };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); };
  }, []);

  // The only way to buy (owners, 2026-11-24: no "Comprar agora"; paying starts in the bag). The button answers at once
  // ("Adicionando…"), then the bag slides in with the piece already there. A tee already in the cart in this size asks
  // first (cart-provider), and "Sim" opens the bag.
  function addToBag() {
    if (state !== "idle") return;
    if (!size) {
      setMissing((count) => count + 1);
      return;
    }
    if (!adicionar({ id: `${product.id}-${size}-${color}`, productId: product.id, name: product.name, price: getProductPrice(product), size, fit: "Regular", color, image: product.image }, openDrawer)) return;
    setState("adding");
    window.setTimeout(() => {
      setState("added");
      openDrawer();
      window.setTimeout(() => setState("idle"), 1400);
    }, ADD_FEEDBACK_MS);
  }

  const label = state === "adding" ? "Adicionando…" : state === "added" ? "Adicionado" : "Adicionar ao carrinho";
  const pick = (value: string) => { setChosen(value); setMissing(0); };

  return <div className="w-full">
    <p className="text-[13px]">Cor: {color}</p>
    {/* Each colour of the same tee (Amore: Preto and Branco) is a pill with its name; the other one opens that colour's
        page, photos and all. */}
    <div className="mt-3 flex flex-wrap gap-2">
      {colorways.map((way) => {
        const active = way.id === product.id;
        const conteudo = <><span className="block h-6 w-6 shrink-0 rounded-full border border-[var(--ink)]/20" style={{ background: SWATCH[way.color] ?? "#ccc" }} /><span>{way.color}</span></>;
        const pilula = "flex min-h-11 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[13px]";
        return active
          ? <span key={way.id} aria-current="true" aria-label={`${way.color}, cor escolhida`} className={`${pilula} shadow-[inset_0_0_0_1.5px_var(--ink)]`}>{conteudo}</span>
          : <Link key={way.id} href={`/produto/${way.id}`} aria-label={`Ver em ${way.color}`} className={`press ${pilula} text-[var(--muted)] shadow-[inset_0_0_0_1px_var(--line)] hover:text-[var(--ink)] hover:shadow-[inset_0_0_0_1px_var(--ink)]`}>{conteudo}</Link>;
      })}
    </div>

    <div className="mt-6 flex items-baseline justify-between text-[13px]">
      <span>Tamanho{size ? <span className="text-[var(--muted)]"> · {size}</span> : null}</span>
      {recommended
        ? <Link href="/meu-fit" className="flex min-h-11 items-center gap-1.5 text-[var(--muted)] hover:text-[var(--ink)]"><span aria-hidden className="h-2 w-2 rounded-full bg-[var(--sol-1)]" />Seu tamanho: {recommended}</Link>
        : <Link href="/meu-fit" className="inline-flex min-h-11 items-center text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Descubra seu tamanho</Link>}
    </div>
    <motion.div key={missing} animate={missing ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.35 }} className="mt-3">
      <SizePills fits={product.fits} size={size} recommended={recommended} onPick={pick} />
    </motion.div>
    {missing > 0 && !size && <p role="alert" className="mt-2 text-[12px] text-[#8a3a2c]">Escolha um tamanho.</p>}

    <div ref={buyRef} className="mt-5 space-y-2.5">
      <button type="button" onClick={addToBag} aria-live="polite" className={`press label flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[12px] text-[var(--creme)] ${state === "adding" ? "bg-[var(--vinho)]/75" : "bg-[var(--vinho)]"}`}>
        {state === "added" && <Check size={15} />}{label}
      </button>
    </div>

    <div className="mt-4 flex items-center justify-between text-[13px] text-[var(--muted)]">
      <Link href={`/provador?produto=${product.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-[var(--ink)]">Ver em você</Link>
      <ShareButton title={product.name} iconOnly className="toque -m-2.5 p-2.5 text-[var(--ink)]" />
    </div>

    {/* Phones: the floating buy bar */}
    <div aria-hidden={!barOn} className={`fixed inset-x-2 bottom-[calc(.5rem+env(safe-area-inset-bottom,0px))] z-[70] space-y-2 transition-[transform,opacity] duration-[280ms] ease-[cubic-bezier(.2,.8,.2,1)] md:hidden ${barOn ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0"}`}>
      <div className="glass flex items-center gap-2.5 rounded-[22px] px-3 py-2">
        <span className="shrink-0 text-[13px] text-[var(--muted)]">Tamanho</span>
        <div className="shelf auto-cols-max gap-1.5">
          <SizePills fits={product.fits} size={size} recommended={recommended} onPick={pick} small />
        </div>
      </div>
      <button type="button" tabIndex={barOn ? 0 : -1} onClick={addToBag} className={`press label flex h-[52px] w-full items-center justify-between rounded-[22px] px-5 text-[12px] text-[var(--creme)] shadow-[0_12px_30px_rgba(0,0,0,.25)] ${missing && !size ? "bg-[#8a3a2c]" : state === "adding" ? "bg-[var(--vinho)]/80" : "bg-[var(--vinho)]"}`}>
        <span className="flex items-center gap-2">{state === "added" && <Check size={15} />}{missing && !size ? "Escolha o tamanho" : label}</span>
        <span className="tabular-nums text-[var(--latao)]">{price}</span>
      </button>
    </div>
  </div>;
}
