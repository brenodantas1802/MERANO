"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, getProductPrice, parcelado, type Product, getPrecoCheio } from "@/lib/products";
import { QuickAdd } from "@/components/quick-add";
import { FavoriteButton } from "@/components/favorite-button";

// A tall photo on the ice-white tile with the piece's other views behind side arrows; underneath, in the Saint Tropez
// way the owners picked (2026-11-24), the name, the price and the price in 3 instalments.
// `destaque`: one of the first cards on the screen, whose photo loads right away instead of lazily (2026-11-24: on the
// shop the first photo is what the page waits on to look ready).
export function ProductCard({ product, destaque = false }: { product: Product; destaque?: boolean }) {
  const cheio = getPrecoCheio(product);
  const price = getProductPrice(product);
  const photos = product.gallery.length ? product.gallery : [product.image];
  const [index, setIndex] = useState(0);
  // The other views load only once the pointer reaches the card.
  const [warm, setWarm] = useState(false);
  const step = (event: MouseEvent, by: number) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + by + photos.length) % photos.length);
  };

  // No rise-in on scroll (owners, 2026-11-22: nothing going up and down): the card is simply there, and the page has
  // one animated component less to start on phones.
  return <article className="group relative">
    <Link href={`/produto/${product.id}`} aria-label={`Ver ${product.name}`} transitionTypes={["nav-forward"]}>
      <ViewTransition name={`produto-${product.id}`} share="morph" default="none">
        <div onPointerEnter={() => setWarm(true)} className="foto-gelo relative aspect-[.82] overflow-hidden">
          {photos.map((src, photo) => (photo === index || warm) && <Image key={src} src={src} alt={photo ? `${product.name}, vista ${photo + 1}` : product.name} {...(destaque && photo === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})} fill quality={90} sizes="(min-width: 768px) 33vw, 50vw" className={`object-cover transition-opacity duration-500 ${photo === index ? "opacity-100" : "opacity-0"}`} />)}
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
            {/* A crossed-out price (the owners' pre-sale price, /admin "Preços") gets a badge; otherwise the launch one. */}
            {(cheio || product.lancamento) && <span className="rounded-full bg-[var(--vinho)] px-2.5 py-1 text-[11px] font-medium text-[var(--creme)]">{cheio ? "Pré-venda" : "Lançamento"}</span>}
            <span className="glass rounded-full px-2.5 py-1 text-[11px] font-medium shadow-none">{product.colors[0]}</span>
          </div>
          {photos.length > 1 && <>
            <button type="button" onClick={(event) => step(event, -1)} aria-label="Vista anterior" className="absolute inset-y-0 left-0 z-10 hidden w-12 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 md:flex"><ChevronLeft size={20} strokeWidth={1.3} /></button>
            <button type="button" onClick={(event) => step(event, 1)} aria-label="Próxima vista" className="absolute inset-y-0 right-0 z-10 hidden w-12 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 md:flex"><ChevronRight size={20} strokeWidth={1.3} /></button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
              {photos.map((src, photo) => <span key={src} className={`h-px w-6 ${photo === index ? "bg-[var(--ink)]" : "bg-[var(--ink)]/25"}`} />)}
            </div>
          </>}
        </div>
      </ViewTransition>
      <div className="px-1 pb-6 pt-3.5">
        <h3 className="sans line-clamp-2 text-[11px] font-semibold uppercase leading-snug tracking-[.2em] text-[var(--ink)]">{product.name}</h3>
        <p className="sans mt-1.5 text-[11px] uppercase tracking-[.16em] text-[var(--ink)]">{cheio && <del className="mr-2 text-[var(--muted)]">{formatPrice(cheio)}</del>}{formatPrice(price)}</p>
        <p className="sans mt-1 text-[12px] text-[var(--muted)]">{parcelado(price)}</p>
      </div>
    </Link>
    <FavoriteButton productId={product.id} name={product.name} className="press toque glass absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-none" />
    <QuickAdd product={product} />
  </article>;
}
