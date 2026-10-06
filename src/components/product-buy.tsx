"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";
import { ShareButton } from "./share-button";
import { useSizeRecommendation } from "@/lib/use-size-recommendation";
import { getProductPrice, type Product } from "@/lib/products";

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

  // Both buttons need a size; "Comprar" goes straight to payment, the cart icon keeps shopping.
  function add() {
    if (!size) {
      setMissing((count) => count + 1);
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

    <motion.label key={missing} animate={missing ? { x: [0, -8, 8, -5, 5, 0] } : undefined} transition={{ duration: 0.4 }} className="relative mt-6 block">
      <span className="sr-only">Tamanho</span>
      <select value={size ?? ""} onChange={(event) => setChosen(event.target.value)} className={`label h-12 w-full cursor-pointer appearance-none border bg-white/70 px-4 text-[12px] outline-none transition-colors focus:border-[var(--ink)] ${missing && !size ? "border-[#8a3a2c]" : "border-[var(--ink)]/20"}`}>
        <option value="" disabled>Selecione o tamanho</option>
        {product.fits.map((value) => <option key={value} value={value}>{value}{value === recommended ? " · seu tamanho" : ""}</option>)}
      </select>
      <ChevronDown size={16} strokeWidth={1.5} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
    </motion.label>
    {missing > 0 && !size && <p role="alert" className="mt-2 text-[12px] text-[#8a3a2c]">Escolha um tamanho.</p>}

    <button type="button" onClick={() => add() && router.push("/pagamento")} className="label mt-3 h-12 w-full bg-[var(--ink)] text-[13px] text-[var(--creme)]">Comprar</button>

    <div className="mt-4 flex items-center justify-between text-[12px] text-[var(--muted)]">
      {recommended
        ? <Link href="/meu-fit" className="flex items-center gap-2 hover:text-[var(--ink)]"><span aria-hidden className="h-2 w-2 rounded-full bg-[var(--sol-1)]" />Seu tamanho: {recommended}</Link>
        : <Link href="/meu-fit" className="underline underline-offset-4 hover:text-[var(--ink)]">Descubra seu tamanho</Link>}
      <Link href={`/provador?produto=${product.id}`} className="underline underline-offset-4 hover:text-[var(--ink)]">Ver em você</Link>
    </div>
    <div className="mt-5 flex items-center gap-4 border-t border-[var(--ink)]/10 pt-4">
      <button type="button" onClick={() => add() && openDrawer()} aria-label="Adicionar ao carrinho" title="Adicionar ao carrinho" className="transition-opacity hover:opacity-70"><ShoppingCart size={17} strokeWidth={1.6} /></button>
      <ShareButton title={product.name} iconOnly className="text-[var(--ink)]" />
    </div>
  </div>;
}
