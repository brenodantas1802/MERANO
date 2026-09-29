"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const { items, total, count, drawerOpen, closeDrawer, removeItem, updateQuantity } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeDrawer(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); };
  }, [drawerOpen, closeDrawer]);

  return <AnimatePresence>
    {drawerOpen && <>
      <motion.div key="overlay" onClick={closeDrawer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" />
      <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label="Sacola" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.45, ease: EASE }} className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-md flex-col bg-[var(--paper)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <p className="sans text-[11px] uppercase tracking-[.18em]">Sua sacola <span className="text-[var(--muted)]">({count})</span></p>
          <button onClick={closeDrawer} aria-label="Fechar sacola" className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)]"><X size={18} strokeWidth={1.5} /></button>
        </div>

        {items.length === 0 ? <div className="flex flex-1 flex-col items-start justify-center px-6">
          <p className="text-3xl">Sua sacola está esperando uma peça.</p>
          <Link href="/shop" onClick={closeDrawer} className="sans mt-8 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.15em]">Ver coleção <ArrowRight size={14} /></Link>
        </div> : <>
          <div className="flex-1 overflow-y-auto px-6">
            {items.map((item) => <div key={item.id} className="flex gap-4 border-b border-[var(--line)] py-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--cream)]">{item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}</div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3"><div><h3 className="text-lg leading-tight">{item.name}</h3><p className="sans mt-1 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Tam. {item.size} · {item.color}</p></div><button onClick={() => removeItem(item.id)} aria-label={`Remover ${item.name}`} className="self-start text-[var(--muted)] hover:text-[var(--ink)]"><Trash2 size={15} strokeWidth={1.5} /></button></div>
                <div className="sans flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center border border-[var(--line)] hover:bg-[var(--ink)] hover:text-[var(--creme)]"><Minus size={12} /></button><span className="w-4 text-center">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center border border-[var(--line)] hover:bg-[var(--ink)] hover:text-[var(--creme)]"><Plus size={12} /></button></div>
                  <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>)}
          </div>
          <div className="border-t border-[var(--ink)] px-6 py-6">
            <div className="flex justify-between text-xl"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <p className="sans mt-2 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Frete calculado na confirmação do pedido.</p>
            <Link href="/pagamento" onClick={closeDrawer} className="mt-6 flex items-center justify-between bg-[var(--ink)] px-5 py-4 text-[var(--creme)] transition-opacity hover:opacity-85"><span className="sans text-[11px] uppercase tracking-[.15em]">Finalizar compra</span><ArrowRight size={16} /></Link>
            <div className="sans mt-4 flex justify-between text-[10px] uppercase tracking-[.14em] text-[var(--muted)]"><button onClick={closeDrawer} className="underline underline-offset-4 hover:text-[var(--ink)]">Continuar comprando</button><Link href="/carrinho" onClick={closeDrawer} className="underline underline-offset-4 hover:text-[var(--ink)]">Ver sacola completa</Link></div>
          </div>
        </>}
      </motion.aside>
    </>}
  </AnimatePresence>;
}
