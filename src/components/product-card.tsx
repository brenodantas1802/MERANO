import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice, getProductPrice } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const discounted = product.salePrice && product.salePrice < product.price;
  return <article className="group relative">
    <Link href={`/produtos/${product.id}`} aria-label={`Ver ${product.name}`}>
      <div className="relative aspect-[.82] overflow-hidden bg-[var(--cream)]">
        <Image src={product.image} alt={product.name} fill className="object-cover transition-opacity duration-500 group-hover:opacity-0" />
        <Image src={product.gallery[1]} alt={`${product.name}, segunda vista`} fill className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {discounted && <span className="sans absolute left-4 top-4 bg-[var(--clay)] px-2 py-1 text-[10px] uppercase tracking-[.12em] text-white">Oferta</span>}
      </div>
      <div className="flex items-start justify-between gap-4 py-4"><div><h3 className="text-xl">{product.name}</h3><p className="sans mt-1 text-[10px] uppercase tracking-[.11em] text-[var(--muted)]">{product.category}</p></div><div className="sans text-right text-sm">{discounted && <del className="mr-2 text-[var(--muted)]">{formatPrice(product.price)}</del>}<strong>{formatPrice(getProductPrice(product))}</strong></div></div>
    </Link>
    <button aria-label={`Adicionar ${product.name} aos favoritos`} className="absolute right-3 top-3 z-10 bg-white/80 p-2 opacity-0 transition-opacity group-hover:opacity-100"><Heart size={16} strokeWidth={1.5} /></button>
    <Link href={`/produtos/${product.id}`} className="sans flex items-center gap-1 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">Ver produto <ArrowUpRight size={13} /></Link>
  </article>;
}
