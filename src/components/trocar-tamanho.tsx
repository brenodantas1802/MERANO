"use client";

import { useCart, type CartItem } from "./cart-provider";
import { produtoDoItem } from "@/lib/products";

// The size of a piece, changed right in the cart, the cart page and the payment summary (a customer, 2026-11-26: to
// change it he had to remove the tee and choose it again). Personalised tees keep the size picked in the Personalizador.
// `compacto`: smaller buttons where the column is narrow (the payment summary on a phone), so P to GG stay on one line.
export function TrocarTamanho({ item, className = "", compacto = false }: { item: CartItem; className?: string; compacto?: boolean }) {
  const { trocarTamanho } = useCart();
  const produto = item.criacaoId ? undefined : produtoDoItem(item);
  if (!produto || produto.fits.length < 2) return null;
  return <div role="radiogroup" aria-label={`Tamanho de ${item.name}`} className={`flex flex-wrap items-center ${compacto ? "gap-1" : "gap-1.5"} ${className}`}>
    {produto.fits.map((tamanho) => {
      const ativo = tamanho === item.size;
      return <button key={tamanho} type="button" role="radio" aria-checked={ativo} aria-label={`Tamanho ${tamanho}`} onClick={() => trocarTamanho(item.id, tamanho)}
        className={`press sans rounded-full font-medium transition-colors ${compacto ? "h-[30px] min-w-[30px] px-1 text-[11px]" : "h-9 min-w-9 px-2 text-[12px]"} ${ativo ? "bg-[var(--vinho)] text-[var(--creme)]" : "bg-white/70 text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(17,17,17,.18)] hover:shadow-[inset_0_0_0_1px_rgba(17,17,17,.6)]"}`}>{tamanho}</button>;
    })}
  </div>;
}
