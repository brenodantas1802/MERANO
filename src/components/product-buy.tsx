"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";
import { ShareButton } from "./share-button";
import { useSizeRecommendation } from "@/lib/use-size-recommendation";
import { formatPrice, getProductPrice, type Product } from "@/lib/products";

// Swatch colours for the colour names used in the catalog.
const SWATCH: Record<string, string> = { Preto: "#1c1c1a", "Azul marinho": "#1f2b45", Natural: "#e9e2d4" };

export type Colorway = { id: string; color: string };

// The buying column of the product page: colour (other colourways are their own pages), size and the cart button.
// The size the customer's Merano Fit profile points to comes preselected.
export function ProductBuy({ product, colorways }: { product: Product; colorways: Colorway[] }) {
  const { recommendation } = useSizeRecommendation(product);
  const recommended = recommendation && product.fits.includes(recommendation.size) ? recommendation.size : null;
  const [chosen, setChosen] = useState<string | null>(null);
  const [missing, setMissing] = useState(0);
  const { addItem, openDrawer } = useCart();
  const router = useRouter();
  const size = chosen ?? recommended;
  const color = product.colors[0];
  const buyRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLLabelElement>(null);
  // On phones, once the buy button has scrolled up out of view, a slim bar keeps "Comprar" at hand.
  const [barOn, setBarOn] = useState(false);
  useEffect(() => {
    const element = buyRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setBarOn(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Both buttons need a size; "Comprar" goes straight to payment, the cart icon keeps shopping.
  function add() {
    if (!size) {
      setMissing((count) => count + 1);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    addItem({ id: `${product.id}-${size}-${color}`, productId: product.id, name: product.name, price: getProductPrice(product), size, fit: "Ampla", color, image: product.image });
    return true;
  }

  return <div className="w-full">
    <p className="text-[13px]">Cor: {color}</p>
    <div className="mt-3 flex gap-2">
      {colorways.map((way) => {
        const active = way.id === product.id;
        const swatch = <span className="block h-9 w-9 border border-[var(--ink)]/15" style={{ background: SWATCH[way.color] ?? "#ccc" }} />;
        return active
          ? <span key={way.id} aria-label={`${way.color}, cor atual`} className="p-0.5 ring-1 ring-[var(--ink)]">{swatch}</span>
          : <Link key={way.id} href={`/produto/${way.id}`} aria-label={`Ver em ${way.color}`} className="p-0.5 ring-1 ring-transparent transition-shadow hover:ring-[var(--ink)]/40">{swatch}</Link>;
      })}
    </div>

    <motion.label ref={sizeRef} key={missing} animate={missing ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.4 }} className="relative mt-6 block">
      <span className="sr-only">Tamanho</span>
      <select value={size ?? ""} onChange={(event) => setChosen(event.target.value)} className={`label h-12 w-full cursor-pointer appearance-none border bg-white/70 px-4 text-[12px] outline-none transition-colors focus:border-[var(--ink)] ${missing && !size ? "border-[#8a3a2c]" : "border-[var(--ink)]/20"}`}>
        <option value="" disabled>Selecione o tamanho</option>
        {product.fits.map((value) => <option key={value} value={value}>{value}{value === recommended ? " · seu tamanho" : ""}</option>)}
      </select>
      <ChevronDown size={16} strokeWidth={1.5} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
    </motion.label>
    {missing > 0 && !size && <p role="alert" className="mt-2 text-[12px] text-[#8a3a2c]">Escolha um tamanho.</p>}

    <div ref={buyRef}><button type="button" onClick={() => add() && router.push("/pagamento")} className="label mt-3 h-12 w-full bg-[var(--ink)] text-[13px] text-[var(--creme)]">Comprar</button></div>

    <div className="mt-2 flex items-center justify-between text-[13px] text-[var(--muted)] [&>a]:py-2">
      {recommended
        ? <Link href="/meu-fit" className="flex items-center gap-2 hover:text-[var(--ink)]"><span aria-hidden className="h-2 w-2 rounded-full bg-[var(--sol-1)]" />Seu tamanho: {recommended}</Link>
        : <Link href="/meu-fit" className="underline underline-offset-4 hover:text-[var(--ink)]">Descubra seu tamanho</Link>}
      <Link href={`/provador?produto=${product.id}`} className="underline underline-offset-4 hover:text-[var(--ink)]">Ver em você</Link>
    </div>
    <div className="mt-5 flex items-center gap-6 border-t border-[var(--ink)]/10 pt-4">
      <button type="button" onClick={() => add() && openDrawer()} aria-label="Adicionar ao carrinho" title="Adicionar ao carrinho" className="-m-2.5 p-2.5 transition-opacity hover:opacity-70"><ShoppingCart size={18} strokeWidth={1.6} /></button>
      <ShareButton title={product.name} iconOnly className="-m-2.5 p-2.5 text-[var(--ink)]" />
    </div>

    <div aria-hidden={!barOn} className={`fixed inset-x-0 bottom-0 z-[70] flex items-center gap-3 border-t border-[var(--line)] bg-[var(--paper)] px-4 pb-[calc(.75rem+env(safe-area-inset-bottom,0px))] pt-3 transition-transform duration-300 md:hidden ${barOn ? "translate-y-0" : "translate-y-full"}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold uppercase tracking-[.04em]">{product.name}</p>
        <p className="text-[13px] text-[var(--muted)]">{formatPrice(getProductPrice(product))}{size ? ` · ${size}` : ""}</p>
      </div>
      <button type="button" tabIndex={barOn ? 0 : -1} onClick={() => add() && router.push("/pagamento")} className="label h-11 shrink-0 bg-[var(--ink)] px-7 text-[13px] text-[var(--creme)]">Comprar</button>
    </div>
  </div>;
}
