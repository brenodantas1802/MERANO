"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { currentImage, formatPrice, similarProducts } from "@/lib/products";

// Free shipping above this subtotal (R$). null hides the progress bar: the owners haven't set a threshold yet.
export const FRETE_GRATIS_ACIMA: number | null = null;

const PANEL = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

// The bag: a frosted panel floating over the page, like the menu. Items are cards with a quantity pill.
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
  const sugestoes = ids.length ? similarProducts(ids, 4) : [];
  const falta = FRETE_GRATIS_ACIMA ? Math.max(0, FRETE_GRATIS_ACIMA - total) : 0;

  return <AnimatePresence>
    {drawerOpen && <>
      <motion.div key="overlay" onClick={closeDrawer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[90] bg-black/25" />
      <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label="Carrinho" initial={{ x: "104%", opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "104%", opacity: 0.6 }} transition={PANEL} className="glass fixed bottom-2 right-2 top-2 z-[91] flex w-[calc(100%-1rem)] max-w-[420px] flex-col overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <p className="text-[15px] font-medium">{count ? `${count} ${count === 1 ? "item" : "itens"} no carrinho` : "Seu carrinho"}</p>
          <button onClick={closeDrawer} aria-label="Fechar carrinho" className="press glass-tile flex h-11 w-11 items-center justify-center rounded-full hover:bg-white"><X size={17} strokeWidth={1.6} /></button>
        </div>

        {items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="display text-4xl">Seu carrinho está esperando uma peça.</p>
          <Link href="/shop" onClick={closeDrawer} className="press label mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--vinho)] px-6 py-3.5 text-[12px] text-[var(--creme)]">Ver coleção <ArrowRight size={14} /></Link>
        </div> : <>
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pb-3">
            <div className="glass-tile rounded-[20px] px-4 py-3.5 text-center">
              {FRETE_GRATIS_ACIMA ? <>
                <p className="label text-[11px]">{falta > 0 ? `Faltam ${formatPrice(falta)} para o frete grátis` : "Frete grátis liberado"}</p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-black/10"><motion.div className="h-full rounded-full bg-[var(--latao)]" initial={false} animate={{ width: `${Math.min(100, (total / FRETE_GRATIS_ACIMA) * 100)}%` }} transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }} /></div>
              </> : <p className="label text-[11px]">Feito sob demanda · produção em até 7 dias úteis</p>}
            </div>

            <AnimatePresence initial={false}>
              {items.map((item) => <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} className="glass-tile flex gap-3.5 overflow-hidden rounded-[20px] p-3">
                <div className="relative h-[104px] w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-white/70">{currentImage(item) && <Image src={currentImage(item)!} alt={item.name} fill sizes="84px" className="object-cover" />}</div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <h3 className="line-clamp-2 text-[14px] font-medium leading-snug">{item.name}</h3>
                    <p className="mt-0.5 text-[14px]">{formatPrice(item.price)}</p>
                    <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{item.size}{item.color ? ` · ${item.color}` : ""}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full bg-white/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="press flex h-11 w-11 items-center justify-center rounded-full"><Minus size={13} /></button>
                      <span className="w-5 text-center text-[13px] tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="press flex h-11 w-11 items-center justify-center rounded-full"><Plus size={13} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} aria-label={`Remover ${item.name}`} className="press flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--ink)]"><Trash2 size={15} strokeWidth={1.5} /></button>
                  </div>
                </div>
              </motion.div>)}
            </AnimatePresence>

            {sugestoes.length > 0 && <div className="glass-tile rounded-[20px] py-3.5">
              <p className="secao px-4 text-[11px]">Combina com</p>
              <div className="shelf mt-2.5 auto-cols-[42%] gap-2.5 px-4 scroll-px-4">
                {sugestoes.map((product) => <Link key={product.id} href={`/produto/${product.id}`} onClick={closeDrawer} className="press block">
                  <span className="relative block aspect-[.82] overflow-hidden rounded-[14px] bg-white/70"><Image src={product.image} alt={product.name} fill sizes="160px" className="object-cover" /></span>
                  <span className="mt-1.5 block truncate text-[12px] font-medium">{product.name}</span>
                  <span className="block text-[12px] text-[var(--muted)]">{formatPrice(product.salePrice ?? product.price)}</span>
                </Link>)}
              </div>
            </div>}
          </div>

          <div className="border-t border-white/60 bg-white/40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3.5">
            <div className="flex items-baseline justify-between px-1"><span className="text-[14px] text-[var(--muted)]">Subtotal</span><span className="text-[17px] font-semibold tabular-nums">{formatPrice(total)}</span></div>
            <Link href="/pagamento" onClick={closeDrawer} className="press label mt-3 flex h-[52px] items-center justify-between rounded-full bg-[var(--vinho)] px-6 text-[12px] text-[var(--creme)]">
              <span>Finalizar compra</span><ArrowRight size={16} />
            </Link>
            <div className="mt-1 flex justify-between px-1 text-[12px] text-[var(--muted)]"><button onClick={closeDrawer} className="press inline-flex min-h-11 items-center underline underline-offset-4 hover:text-[var(--ink)]">Continuar comprando</button><Link href="/carrinho" onClick={closeDrawer} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-[var(--ink)]">Ver carrinho</Link></div>
          </div>
        </>}
      </motion.aside>
    </>}
  </AnimatePresence>;
}
