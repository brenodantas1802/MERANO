"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { useSizeRecommendation } from "@/lib/use-size-recommendation";
import { getProductPrice, type Product } from "@/lib/products";

// Cart button on product cards: a size is required, so it opens a size picker over the photo first.
export function QuickAdd({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { addItem, openDrawer } = useCart();
  const recommended = useSizeRecommendation(product).recommendation?.size;

  function stop(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function add(event: React.MouseEvent, size: string) {
    stop(event);
    addItem({ id: `${product.id}-${size}-${product.colors[0]}`, productId: product.id, name: product.name, price: getProductPrice(product), size, fit: "Ampla", color: product.colors[0], image: product.image });
    setOpen(false);
    openDrawer();
  }

  // Sits over the card photo (same aspect ratio) so the picker lines up with it.
  return <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[.82]">
    <button type="button" onClick={(event) => { stop(event); setOpen((value) => !value); }} aria-label={`Adicionar ${product.name} ao carrinho`} aria-expanded={open} className="pointer-events-auto absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--creme)]/90 shadow-sm transition-all hover:bg-[var(--ink)] hover:text-[var(--creme)] md:opacity-0 md:group-hover:opacity-100">
      {open ? <X size={16} strokeWidth={1.5} /> : <ShoppingBag size={16} strokeWidth={1.5} />}
    </button>
    <AnimatePresence>
      {open && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.25 }} onClick={stop} className="pointer-events-auto absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-[var(--paper)]/95 p-4 shadow-lg backdrop-blur">
        <p className="script -rotate-1 text-xl text-[var(--terra)]">qual o seu tamanho?</p>
        <div className="mt-2 flex flex-wrap gap-2">{product.fits.map((size) => <button key={size} type="button" onClick={(event) => add(event, size)} className={`sans h-10 w-10 rounded-full border text-xs transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)] ${size === recommended ? "border-[var(--sol-1)] text-[var(--sol-1)]" : "border-[var(--ink)]/30"}`}>{size}</button>)}</div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
