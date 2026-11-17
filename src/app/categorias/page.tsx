import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ESPADAS } from "@/components/hero-topo";
import { collections, products } from "@/lib/products";

// The pieces are grouped by collection (the owners asked on 2026-11-17 for "Summer Collection 01" here).
export default function CategoriesPage() {
  const cards = collections.map((collection) => ({ ...collection, count: products.filter((product) => product.collection === collection.id).length })).filter((collection) => collection.count > 0);

  return <main className="sunset-glow"><SiteHeader />
    <div className="mx-auto max-w-360 px-6 pb-20 pt-10 md:px-12 md:pt-14">
      <h1 className="display mb-8 text-5xl md:text-6xl">Categorias</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((collection, index) => (
          <ScrollReveal key={collection.id} delay={index * 0.08}>
            <Link href={`/shop?colecao=${collection.id}`} className="group relative flex aspect-[.9] flex-col justify-end overflow-hidden bg-[var(--areia)] p-7 transition-transform duration-500 ease-out hover:-translate-y-1">
              <Image src={collection.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain p-[10%] pb-[30%] transition-transform duration-700 ease-out group-hover:scale-105" />
              <span className="sans relative text-[11px] uppercase tracking-[.14em] text-[var(--terra-dark)]">{collection.count} peça{collection.count > 1 ? "s" : ""}</span>
              <h2 className="relative mt-2 flex items-center gap-2 text-3xl text-[var(--terra-dark)]">{collection.name} <ArrowUpRight size={20} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></h2>
            </Link>
          </ScrollReveal>
        ))}
        <ScrollReveal delay={cards.length * 0.08}>
          <div className="feltro relative flex aspect-[.9] flex-col justify-end overflow-hidden p-7">
            <svg aria-hidden viewBox="0 0 100 100" className="absolute left-1/2 top-[14%] w-[44%] -translate-x-1/2"><path d={ESPADAS} fill="none" stroke="var(--latao)" strokeWidth={0.7} /></svg>
            <span className="sans relative z-10 text-[11px] uppercase tracking-[.14em] text-[var(--latao)]">Em breve</span>
            <h2 className="relative z-10 mt-2 text-3xl text-[var(--creme)]">Próxima coleção</h2>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </main>;
}
