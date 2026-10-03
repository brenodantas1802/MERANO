"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { ShirtFan } from "@/components/try-on-visuals";
import { PillLink } from "@/components/ui/pill-link";
import { currentImage, formatPrice } from "@/lib/products";

function CartContent() {
  const { items, total, count, removeItem, updateQuantity } = useCart();

  if (items.length === 0) return <div className="mt-12 flex flex-col items-center rounded-[2rem] bg-[var(--paper)] px-6 py-16 text-center shadow-[0_30px_60px_-45px_rgba(32,28,23,.55)]">
    <ShirtFan size={110} />
    <p className="display mt-10 text-4xl md:text-5xl">Seu carrinho está<br /><i>esperando uma peça.</i></p>
    <p className="mt-4 max-w-md text-lg text-[var(--ink)]/70">Cada camiseta é feita depois do seu pedido — escolha a sua estampa e a gente começa.</p>
    <div className="mt-8"><PillLink href="/shop" variant="solid">Ver a coleção</PillLink></div>
  </div>;

  return <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,1fr)_380px] md:gap-14">
    <ul className="space-y-4">
      {items.map((item) => {
        const image = currentImage(item);
        return <li key={item.id} className="flex gap-4 rounded-[1.75rem] bg-[var(--paper)] p-4 shadow-[0_24px_50px_-40px_rgba(32,28,23,.6)] md:gap-7 md:p-5">
          <Link href={item.productId ? `/produto/${item.productId}` : "/shop"} className="relative aspect-[.82] w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--cream)] md:w-36">
            {image ? <Image src={image} alt={item.name} fill sizes="144px" className="object-cover" /> : <div className="product-wash h-full w-full" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0"><h2 className="truncate text-2xl md:text-3xl">{item.name}</h2><p className="sans mt-1 text-sm text-[var(--muted)]">Tamanho {item.size} · {item.color}</p></div>
              <button onClick={() => removeItem(item.id)} aria-label={`Remover ${item.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><Trash2 size={16} strokeWidth={1.6} /></button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="sans flex items-center gap-1 rounded-full border border-[var(--ink)]/15 p-1">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><Minus size={13} /></button>
                <span className="w-7 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"><Plus size={13} /></button>
              </div>
              <span className="display text-xl md:text-2xl">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
        </li>;
      })}
    </ul>

    <aside className="h-fit rounded-[2rem] bg-[var(--mar-fundo)] p-7 text-[var(--paper)] shadow-[0_30px_60px_-40px_rgba(15,61,68,.9)] md:sticky md:top-[calc(var(--header-h,72px)+1.5rem)]">
      <p className="serif-note text-2xl text-[var(--sol-2)]">seu pedido</p>
      <div className="mt-5 space-y-3 border-b border-white/15 pb-5 text-[15px]">
        <div className="flex justify-between"><span className="text-white/75">{count} {count === 1 ? "peça" : "peças"}</span><span>{formatPrice(total)}</span></div>
        <div className="flex justify-between"><span className="text-white/75">Frete</span><span className="text-white/75">calculado no próximo passo</span></div>
      </div>
      <div className="mt-5 flex items-baseline justify-between"><span className="text-lg">Total</span><span className="display text-4xl">{formatPrice(total)}</span></div>
      <p className="sans mt-1 text-right text-xs text-white/60">ou 3x de {formatPrice(total / 3)} sem juros</p>
      <Link href="/pagamento" className="sans mt-7 block rounded-full bg-[var(--paper)] px-6 py-4 text-center text-[12px] font-medium uppercase tracking-[.16em] text-[var(--ink)] transition-colors hover:bg-[var(--sol-2)]">Finalizar compra</Link>
      <p className="sans mt-4 text-center text-xs text-white/60">Produção sob demanda em até 7 dias úteis + envio</p>
    </aside>
  </div>;
}

export default function CartPage() {
  return <>
    <SiteHeader />
    <main className="season-wash min-h-[80svh]">
      <div className="mx-auto max-w-360 px-6 pb-24 pt-10 md:px-12 md:pt-14">
        <p className="serif-note text-2xl text-[var(--sol-1)] md:text-3xl">sua seleção</p>
        <h1 className="display mt-1 text-6xl md:text-8xl">Carrinho.</h1>
        <CartContent />
        <Link href="/shop" className="sans mt-12 flex w-fit items-center gap-2 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"><ArrowLeft size={14} /> Continuar escolhendo</Link>
      </div>
    </main>
  </>;
}
