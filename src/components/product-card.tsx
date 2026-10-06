"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ViewTransition, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { QuickAdd } from "@/components/quick-add";

const EASE = [0.22, 1, 0.36, 1] as const;

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

  return <motion.article
    className="group relative"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }}
    viewport={{ once: true, margin: "-80px" }}
  >
    <Link href={`/produto/${product.id}`} aria-label={`Ver ${product.name}`} transitionTypes={["nav-forward"]}>
      <ViewTransition name={`produto-${product.id}`} share="morph" default="none">
        <div onPointerEnter={() => setWarm(true)} className="relative aspect-[.82] overflow-hidden bg-[var(--cream)]/40">
          {photos.map((src, photo) => (photo === index || warm) && <Image key={src} src={src} alt={photo ? `${product.name}, vista ${photo + 1}` : product.name} fill sizes="(min-width: 768px) 33vw, 50vw" className={`object-cover transition-opacity duration-500 ${photo === index ? "opacity-100" : "opacity-0"}`} />)}
          {discounted && <span className="sans absolute left-4 top-4 rounded-full bg-[var(--sol-1)] px-3 py-1 text-[11px] uppercase tracking-[.12em] text-white">Oferta</span>}
          {photos.length > 1 && <>
            <button type="button" onClick={(event) => step(event, -1)} aria-label="Vista anterior" className="absolute inset-y-0 left-0 z-10 hidden w-12 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 md:flex"><ChevronLeft size={20} strokeWidth={1.3} /></button>
            <button type="button" onClick={(event) => step(event, 1)} aria-label="Próxima vista" className="absolute inset-y-0 right-0 z-10 hidden w-12 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 md:flex"><ChevronRight size={20} strokeWidth={1.3} /></button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
              {photos.map((src, photo) => <span key={src} className={`h-px w-6 ${photo === index ? "bg-[var(--ink)]" : "bg-[var(--ink)]/25"}`} />)}
            </div>
          </>}
        </div>
      </ViewTransition>
      <h3 className="truncate px-2 pb-5 pt-3 text-center text-[13px] font-semibold uppercase tracking-[.06em] text-[var(--ink)]">{product.name}</h3>
    </Link>
    <QuickAdd product={product} />
  </motion.article>;
}
