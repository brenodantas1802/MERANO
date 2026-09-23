"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice, getProductPrice } from "@/lib/products";
import { FavoriteButton } from "@/components/favorite-button";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product }: { product: Product }) {
  const discounted = product.salePrice && product.salePrice < product.price;
  return <motion.article
    className="group relative"
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }}
    viewport={{ once: true, margin: "-80px" }}
    whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.4, ease: EASE } }}
  >
    <Link href={`/produto/${product.id}`} aria-label={`Ver ${product.name}`}>
      <div className="relative aspect-[.82] overflow-hidden bg-[var(--cream)] shadow-[0_0_0_rgba(25,35,30,0)] transition-shadow duration-500 ease-out group-hover:shadow-[0_18px_40px_-16px_rgba(25,35,30,0.35)]">
        <Image src={product.image} alt={product.name} fill className="object-cover transition-opacity duration-500 group-hover:opacity-0" />
        <Image src={product.gallery[1]} alt={`${product.name}, segunda vista`} fill className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {discounted && <span className="sans absolute left-4 top-4 bg-[var(--clay)] px-2 py-1 text-[10px] uppercase tracking-[.12em] text-white">Oferta</span>}
      </div>
      <div className="flex items-start justify-between gap-4 py-4"><div><h3 className="text-xl">{product.name}</h3><p className="sans mt-1 text-[10px] uppercase tracking-[.11em] text-[var(--muted)]">{product.category}</p></div><div className="sans text-right text-sm">{discounted && <del className="mr-2 text-[var(--muted)]">{formatPrice(product.price)}</del>}<strong>{formatPrice(getProductPrice(product))}</strong></div></div>
    </Link>
    <FavoriteButton productId={product.id} name={product.name} className="absolute right-3 top-3 z-10 bg-[var(--creme)]/90 p-2 opacity-0 transition-opacity group-hover:opacity-100" />
    <Link href={`/produto/${product.id}`} className="sans flex items-center gap-1 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">Ver produto <ArrowUpRight size={13} /></Link>
  </motion.article>;
}
