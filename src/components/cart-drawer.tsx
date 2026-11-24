"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { currentImage, formatPrice, getProductPrice, parcelado, similarProducts, type Product } from "@/lib/products";

// Free shipping above this subtotal (R$). null hides the progress bar: the owners haven't set a threshold yet.
export const FRETE_GRATIS_ACIMA: number | null = null;

const PANEL = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;
const FORMAS = ["Pix", "Visa", "Mastercard", "Elo", "Amex"];

// "Talvez você goste": a row that slides sideways. On a phone the finger drags it; on a computer the arrows (a mouse
// wheel only scrolls down, which is why the old row seemed stuck), and the bar under it shows where you are.
function Sugestoes({ produtos, onAbrir }: { produtos: Product[]; onAbrir: () => void }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [barra, setBarra] = useState({ inicio: 0, tamanho: 1 });
  const medir = () => {
    const el = trilho.current;
    if (el) setBarra({ inicio: el.scrollLeft / el.scrollWidth, tamanho: Math.min(1, el.clientWidth / el.scrollWidth) });
  };
  // Measured whenever the row changes size (it also fires once at the start).
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  const passar = (lado: number) => trilho.current?.scrollBy({ left: lado * trilho.current.clientWidth * 0.8, behavior: "smooth" });
  const seta = "press flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)] disabled:opacity-35";

  return <div className="glass-tile rounded-[22px] py-4">
    <div className="flex items-center justify-between px-4">
      <p className="text-[16px] font-semibold">Talvez você goste</p>
      {barra.tamanho < 1 && <div className="flex gap-1.5">
        <button type="button" onClick={() => passar(-1)} disabled={barra.inicio <= 0.001} aria-label="Ver as anteriores" className={seta}><ChevronLeft size={16} strokeWidth={1.6} /></button>
        <button type="button" onClick={() => passar(1)} disabled={barra.inicio + barra.tamanho >= 0.999} aria-label="Ver mais" className={seta}><ChevronRight size={16} strokeWidth={1.6} /></button>
      </div>}
    </div>
    <div ref={trilho} onScroll={medir} className="shelf mt-3 auto-cols-[40%] gap-2.5 px-4 scroll-px-4">
      {produtos.map((product) => <Link key={product.id} href={`/produto/${product.id}`} onClick={onAbrir} className="press block min-w-0">
        <span className="foto-gelo relative block aspect-[.82] overflow-hidden rounded-[14px]"><Image src={product.image} alt={product.name} fill sizes="170px" className="object-cover" /></span>
        <span className="mt-2 block truncate text-[13px]">{product.name}</span>
        <span className="block text-[13px] text-[var(--muted)]">{formatPrice(getProductPrice(product))}</span>
      </Link>)}
    </div>
    {barra.tamanho < 1 && <div className="mx-4 mt-3.5 h-[3px] overflow-hidden rounded-full bg-black/10">
      <div className="h-full rounded-full bg-[var(--ink)]/55 transition-[margin] duration-150" style={{ width: `${barra.tamanho * 100}%`, marginLeft: `${barra.inicio * 100}%` }} />
    </div>}
  </div>;
}

// The bag (owners, 2026-11-24, after the Ermos cart): a frosted panel over the page, every part in its own white card,
// pieces that slide sideways under "Talvez você goste", and "Finalizar compra" always at the bottom.
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

  const ids = items.flatMap((item) => (item.productId ? [item.productId] : []));
  const sugestoes = ids.length ? similarProducts(ids, 6) : [];
  const falta = FRETE_GRATIS_ACIMA ? Math.max(0, FRETE_GRATIS_ACIMA - total) : 0;

  return <AnimatePresence>
    {drawerOpen && <>
      <motion.div key="overlay" onClick={closeDrawer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[90] bg-black/20" />
      <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label="Carrinho" initial={{ x: "104%", opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "104%", opacity: 0.6 }} transition={PANEL} className="vidro-carrinho fixed bottom-2 right-2 top-2 z-[91] flex w-[calc(100%-1rem)] max-w-[440px] flex-col overflow-hidden rounded-[30px]">
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <p className="text-[17px]">{count ? `${count} ${count === 1 ? "item" : "itens"} no carrinho` : "Seu carrinho"}</p>
          <button onClick={closeDrawer} aria-label="Fechar carrinho" className="press flex h-11 w-11 items-center justify-center rounded-full bg-white/70 shadow-[inset_0_0_0_1px_rgba(0,0,0,.05)] hover:bg-white"><X size={17} strokeWidth={1.6} /></button>
        </div>

        {items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="display text-4xl">Seu carrinho está esperando uma peça.</p>
          <Link href="/shop" onClick={closeDrawer} className="press label mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--vinho)] px-6 py-3.5 text-[12px] text-[var(--creme)]">Ver coleção <ArrowRight size={14} /></Link>
        </div> : <>
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pb-3">
            <div className="glass-tile rounded-[22px] px-4 py-4 text-center">
              {FRETE_GRATIS_ACIMA ? <>
                <p className="sans text-[12px] uppercase tracking-[.16em]">{falta > 0 ? `Faltam ${formatPrice(falta)} para o frete grátis` : "Frete grátis liberado"}</p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-black/10"><motion.div className="h-full rounded-full bg-[var(--latao)]" initial={false} animate={{ width: `${Math.min(100, (total / FRETE_GRATIS_ACIMA) * 100)}%` }} transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }} /></div>
              </> : <p className="sans text-[12px] uppercase tracking-[.16em] text-[var(--ink)]/80">Frete calculado pelo seu CEP no pagamento</p>}
            </div>

            <AnimatePresence initial={false}>
              {items.map((item) => <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} className="glass-tile flex gap-4 overflow-hidden rounded-[22px] p-3.5">
                <div className="foto-gelo relative h-[120px] w-[96px] shrink-0 overflow-hidden rounded-[14px]">{currentImage(item) && <Image src={currentImage(item)!} alt={item.name} fill sizes="96px" className="object-cover" unoptimized={currentImage(item)!.startsWith("data:")} />}</div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <h3 className="line-clamp-2 text-[15px] leading-snug">{item.name}</h3>
                    <p className="mt-0.5 text-[15px]">{formatPrice(item.price)}</p>
                    <p className="mt-0.5 truncate text-[13px] text-[var(--muted)]">{item.size}{item.color ? ` · ${item.color}` : ""}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full bg-white/90 shadow-[inset_0_0_0_1px_rgba(0,0,0,.07)]">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="press flex h-10 w-10 items-center justify-center rounded-full"><Minus size={13} /></button>
                      <span className="w-5 text-center text-[14px] tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="press flex h-10 w-10 items-center justify-center rounded-full"><Plus size={13} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} aria-label={`Remover ${item.name}`} className="press flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--ink)]"><Trash2 size={16} strokeWidth={1.5} /></button>
                  </div>
                </div>
              </motion.div>)}
            </AnimatePresence>

            {sugestoes.length > 0 && <Sugestoes produtos={sugestoes} onAbrir={closeDrawer} />}

            <p className="glass-tile rounded-[22px] px-4 py-3.5 text-center text-[13px] text-[var(--muted)]">Envio rastreado · Pagamento seguro · {parcelado(total)}</p>
          </div>

          <div className="px-3 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))]">
            <div className="glass-tile rounded-[22px] px-4 pb-3.5 pt-4">
              <div className="flex items-baseline justify-between px-1">
                <span><span className="block text-[16px]">Subtotal</span><span className="block text-[12px] text-[var(--muted)]">{count} {count === 1 ? "item" : "itens"}</span></span>
                <span className="text-[20px] tabular-nums">{formatPrice(total)}</span>
              </div>
              <Link href="/pagamento" onClick={closeDrawer} className="press label mt-3.5 flex h-14 items-center justify-center rounded-full bg-[var(--vinho)] text-[13px] tracking-[.14em] text-[var(--creme)] shadow-[0_14px_30px_-16px_rgba(85,30,43,.8)] hover:opacity-95">Finalizar compra</Link>
              <p className="mt-2.5 text-center text-[12px] text-[var(--muted)]">Frete calculado no pagamento</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5" aria-label="Formas de pagamento">
                {FORMAS.map((forma) => <span key={forma} className="sans rounded-[5px] border border-black/10 bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[.06em] text-[var(--ink)]/75">{forma}</span>)}
              </div>
            </div>
          </div>
        </>}
      </motion.aside>
    </>}
  </AnimatePresence>;
}
