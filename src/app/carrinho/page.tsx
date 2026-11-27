"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { MAX_POR_PECA, useCart } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { ShirtFan } from "@/components/try-on-visuals";
import { PillLink } from "@/components/ui/pill-link";
import { currentImage, percentualPreVenda, formatPrice, parcelado, produtoDoItem } from "@/lib/products";
import { CEP_KEY, chegadaTexto, useFrete } from "@/lib/use-frete";
import { TrocarTamanho } from "@/components/trocar-tamanho";

const maskCep = (value: string) => value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

function lerCep() {
  try {
    return typeof window === "undefined" ? "" : window.localStorage.getItem(CEP_KEY) ?? "";
  } catch {
    return "";
  }
}

function CartContent() {
  const { items, total, count, removeItem, updateQuantity } = useCart();
  // Shipping right in the cart: the cheapest SuperFrete option for the CEP (the payment page lists all of them).
  const [cep, setCep] = useState(lerCep);
  const frete = useFrete(cep, count);
  const maisBarato = frete.opcoes[0] ?? null;
  const totalComFrete = total + (maisBarato?.preco ?? 0);
  function updateCep(value: string) {
    const masked = maskCep(value);
    setCep(masked);
    try { window.localStorage.setItem(CEP_KEY, masked); } catch { /* the CEP just won't be remembered */ }
  }

  if (items.length === 0) return <div className="mt-12 flex flex-col items-center rounded-[2rem] bg-[var(--paper)] px-6 py-16 text-center shadow-[0_30px_60px_-45px_rgba(32,28,23,.55)]">
    <ShirtFan size={110} />
    <p className="display mt-10 text-4xl md:text-5xl">Seu carrinho está<br /><i>esperando uma peça.</i></p>
    <p className="mt-4 max-w-md text-lg text-[var(--ink)]/70">Escolha a sua estampa da Summer Collection 01.</p>
    <div className="mt-8"><PillLink href="/shop" variant="solid">Ver a coleção</PillLink></div>
  </div>;

  return <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_380px] md:gap-14">
    <ul className="space-y-4">
      {items.map((item) => {
        const image = currentImage(item);
        return <li key={item.chave ?? item.id} className="flex gap-4 rounded-[1.75rem] bg-[var(--paper)] p-4 shadow-[0_24px_50px_-40px_rgba(32,28,23,.6)] md:gap-7 md:p-5">
          <Link href={item.criacaoId ? "/personalizar-estampa" : `/produto/${produtoDoItem(item)?.id ?? item.productId ?? ""}`} className="foto-gelo relative aspect-[.82] w-24 shrink-0 overflow-hidden rounded-2xl md:w-36">
            {image ? <Image src={image} alt={item.name} fill sizes="144px" className="object-cover" /> : <div className="product-wash h-full w-full" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0"><h2 className="text-2xl leading-tight [overflow-wrap:anywhere] md:text-3xl">{item.criacaoId ? item.name : <Link href={`/produto/${produtoDoItem(item)?.id ?? item.productId ?? ""}`} className="hover:underline hover:underline-offset-4">{item.name}</Link>}</h2>{item.criacaoId ? <p className="sans mt-1 text-sm text-[var(--muted)]">Tamanho {item.size} · {item.color}</p> : <><p className="sans mt-1 text-sm text-[var(--muted)]">{item.color}</p><TrocarTamanho item={item} className="mt-3" /></>}</div>
              <button onClick={() => removeItem(item.id)} aria-label={`Remover ${item.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><Trash2 size={16} strokeWidth={1.6} /></button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="sans flex items-center gap-1 rounded-full border border-[var(--ink)]/15 p-1">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><Minus size={13} /></button>
                <span className="w-7 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= MAX_POR_PECA} aria-label={`Aumentar quantidade de ${item.name}`} title={item.quantity >= MAX_POR_PECA ? `Até ${MAX_POR_PECA} por pedido` : undefined} className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"><Plus size={13} /></button>
              </div>
              <span className="display text-xl md:text-2xl">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
        </li>;
      })}
    </ul>

    {/* Light summary (2026-11-24), like the checkout's ice column; the old wine block went with the new palette. */}
    <aside className="h-fit rounded-[2rem] bg-[var(--gelo)] p-7 text-[var(--ink)] md:sticky md:top-[calc(var(--header-h,72px)+1.5rem)]">
      <div className="mt-5 space-y-3 border-b border-[var(--line)] pb-5 text-[15px]">
        <div className="flex justify-between"><span className="text-[var(--muted)]">{count} {count === 1 ? "peça" : "peças"}</span><span>{formatPrice(total)}</span></div>
        {percentualPreVenda(items) > 0 && <p className="-mt-1.5 text-[12px] text-[var(--vinho)]">Preço de pré-venda: {percentualPreVenda(items)}% de desconto.</p>}
        <div className="flex justify-between"><span className="text-[var(--muted)]">Frete</span><span className={maisBarato ? "" : "text-[var(--muted)]"}>{frete.carregando ? "calculando…" : maisBarato ? formatPrice(maisBarato.preco) : "informe o CEP"}</span></div>
        <label className="sans flex items-center gap-3 text-[12px] text-[var(--muted)]">CEP
          <input inputMode="numeric" autoComplete="postal-code" value={cep} onChange={(event) => updateCep(event.target.value)} placeholder="00000-000" aria-label="CEP para calcular o frete" className="h-11 min-w-0 flex-1 rounded-full border border-[var(--borda-campo)] bg-[var(--paper)] px-4 text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]/60 focus:border-[var(--vinho)]" />
        </label>
        <p aria-live="polite" className="sans min-h-4 text-xs text-[var(--muted)]">{frete.erro ?? (maisBarato ? `${maisBarato.nome} · ${chegadaTexto(maisBarato).toLowerCase()}${frete.opcoes.length > 1 ? ` · mais ${frete.opcoes.length - 1} ${frete.opcoes.length > 2 ? "opções" : "opção"} no pagamento` : ""}` : "")}{frete.exemplo && " · valores de exemplo"}</p>
      </div>
      <div className="mt-5 flex items-baseline justify-between"><span className="text-lg">Total</span><span className="display text-4xl">{formatPrice(totalComFrete)}</span></div>
      <p className="sans mt-1 text-right text-xs text-[var(--muted)]">ou {parcelado(totalComFrete)}</p>
      <Link href="/pagamento" className="press label mt-7 flex h-14 items-center justify-center rounded-full bg-[var(--vinho)] text-[13px] tracking-[.14em] text-[var(--creme)] shadow-[0_14px_30px_-16px_rgba(85,30,43,.8)] hover:opacity-95">Finalizar compra</Link>
    </aside>
  </div>;
}

export default function CartPage() {
  return <>
    <SiteHeader />
    <main className="season-wash min-h-[80svh]">
      <div className="mx-auto max-w-360 px-6 pb-24 pt-10 md:px-12 md:pt-14">
        <h1 className="display mt-1 text-6xl md:text-8xl">Carrinho.</h1>
        <CartContent />
        <Link href="/shop" className="sans mt-12 flex min-h-11 w-fit items-center gap-2 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"><ArrowLeft size={14} /> Continuar escolhendo</Link>
      </div>
    </main>
  </>;
}
