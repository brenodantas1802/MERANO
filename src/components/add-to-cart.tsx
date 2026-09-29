"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { useSizeRecommendation } from "@/lib/use-size-recommendation";
import type { Product } from "@/lib/products";
import { getProductPrice } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { recommendation, hasProfile } = useSizeRecommendation(product);
  const recommended = recommendation?.size ?? null;
  const [chosenSize, setChosenSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]);
  const [missingSize, setMissingSize] = useState(false);
  const [shake, setShake] = useState(0);
  const sizesRef = useRef<HTMLDivElement>(null);
  const { addItem, openDrawer } = useCart();
  const router = useRouter();
  const size = chosenSize ?? (recommended && product.fits.includes(recommended) ? recommended : null);

  function add() {
    if (!size) {
      setMissingSize(true);
      setShake((count) => count + 1);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    addItem({ id: `${product.id}-${size}-${color}`, productId: product.id, name: product.name, price: getProductPrice(product), size, fit: "Ampla", color, image: product.image });
    return true;
  }

  return <div className="sans">
    <div className="mb-7 space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[.14em]"><span>Tamanho{size && <span className="text-[var(--muted)]"> · {size}</span>}</span><a href="#medidas" className="text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Tabela de medidas</a></div>
        <motion.div ref={sizesRef} key={shake} animate={shake ? { x: [0, -10, 10, -7, 7, -3, 0] } : undefined} transition={{ duration: 0.5 }} role="radiogroup" aria-label="Tamanho" className="flex flex-wrap gap-2">{product.fits.map((value) => <button key={value} type="button" role="radio" aria-checked={size === value} onClick={() => { setChosenSize(value); setMissingSize(false); }} className={`relative h-12 w-12 rounded-full border text-xs transition-colors ${size === value ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--creme)]" : "border-[var(--ink)]/25 hover:border-[var(--ink)]"}`}>{value}{value === recommended && <span aria-hidden className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--paper)] bg-[var(--sol-1)]" />}</button>)}</motion.div>
        {recommendation ? <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[var(--sol-2)]/15 px-4 py-3">
          <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--sol-1)]" />
          <p className="text-[13px] normal-case leading-snug tracking-normal">Recomendamos o tamanho <strong>{recommendation.size}</strong> com base no seu perfil. <span className="text-[var(--muted)]">{recommendation.reason}</span> <Link href="/conta/sobre-mim" className="whitespace-nowrap underline underline-offset-4 hover:text-[var(--sol-1)]">Ver perfil</Link></p>
        </div> : <Link href="/conta/sobre-mim" className="mt-3 inline-block text-[11px] text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline">{hasProfile ? "Complete suas medidas para ver o tamanho ideal →" : "Cadastre suas medidas para recomendações personalizadas →"}</Link>}
        
      </div>
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[.14em]">Cor<span className="text-[var(--muted)]"> · {color}</span></p>
        <div role="radiogroup" aria-label="Cor" className="flex flex-wrap gap-2">{product.colors.map((value) => <button key={value} type="button" role="radio" aria-checked={color === value} onClick={() => setColor(value)} className={`h-10 rounded-full border px-5 text-[11px] uppercase tracking-[.08em] transition-colors ${color === value ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--creme)]" : "border-[var(--ink)]/25 hover:border-[var(--ink)]"}`}>{value}</button>)}</div>
      </div>
    </div>
    {missingSize && <p role="alert" className="sans mb-4 w-fit -rotate-1 rounded-full bg-[#8a3a2c] px-4 py-2 text-[12px] text-white">Escolha um tamanho antes de continuar ↑</p>}
    <button onClick={() => add() && router.push("/pagamento")} className="w-full rounded-full bg-[var(--ink)] px-6 py-4 text-[12px] uppercase tracking-[.16em] text-[var(--creme)] transition-transform hover:-translate-y-0.5">Comprar agora</button>
    <button onClick={() => add() && openDrawer()} className="mt-3 w-full rounded-full border border-[var(--ink)] px-6 py-3.5 text-[12px] uppercase tracking-[.16em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)]">Adicionar ao carrinho</button>
  </div>;
}
