"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { QuickAdd } from "@/components/quick-add";
import { FavoriteButton } from "@/components/favorite-button";

// A tall photo with the piece's other views behind side arrows, and its name centred underneath (prices are shown on
// the product page only).
export function ProductCard({ product }: { product: Product }) {
  const discounted = product.salePrice && product.salePrice < product.price;
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
        <div onPointerEnter={() => setWarm(true)} className="relative aspect-[.82] overflow-hidden bg-[var(--cream)]/40">
          {photos.map((src, photo) => (photo === index || warm) && <Image key={src} src={src} alt={photo ? `${product.name}, vista ${photo + 1}` : product.name} fill sizes="(min-width: 768px) 33vw, 50vw" className={`object-cover transition-opacity duration-500 ${photo === index ? "opacity-100" : "opacity-0"}`} />)}
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
            {/* The lower price is the pre-sale's (R$ 160 instead of R$ 180): one badge says it. */}
            {(discounted || product.lancamento) && <span className="rounded-full bg-[var(--vinho)] px-2.5 py-1 text-[11px] font-medium text-[var(--creme)]">{discounted ? "Pré-venda" : "Lançamento"}</span>}
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
      <h3 className="line-clamp-2 px-2 pb-5 pt-3 text-center text-[13px] font-semibold uppercase leading-snug tracking-[.06em] text-[var(--ink)]">{product.name}</h3>
    </Link>
    <FavoriteButton productId={product.id} name={product.name} className="press toque glass absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-none" />
    <QuickAdd product={product} />
  </article>;
}
