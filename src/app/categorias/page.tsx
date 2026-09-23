import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { products } from "@/lib/products";

export default function CategoriesPage() {
  const categories = Array.from(new Set(products.map((product) => product.category))).map((category) => ({
    name: category,
    count: products.filter((product) => product.category === category).length,
  }));

  return <main><SiteHeader />
    <div className="mx-auto max-w-360 px-6 pb-28 pt-8 md:px-12">
      <Link href="/" className="sans mb-16 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Voltar para o início</Link>
      <ScrollReveal className="mb-16 border-b border-[var(--line)] pb-14"><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Navegue por categoria</p><h1 className="display text-6xl md:text-8xl">Categorias.</h1><p className="mt-6 max-w-md text-xl">A Merano está no início. Mais categorias chegam junto das próximas coleções.</p></ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category, index) => (
          <ScrollReveal key={category.name} delay={index * 0.08}>
            <Link href={`/shop?categoria=${encodeURIComponent(category.name)}`} className="group relative flex aspect-[.9] flex-col justify-end overflow-hidden bg-[var(--areia)] p-7 transition-transform duration-500 ease-out hover:-translate-y-1">
              <span className="sans text-[10px] uppercase tracking-[.14em] text-[var(--terra-dark)]">{category.count} peça{category.count > 1 ? "s" : ""}</span>
              <h2 className="mt-2 flex items-center gap-2 text-3xl text-[var(--terra-dark)]">{category.name} <ArrowUpRight size={20} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></h2>
            </Link>
          </ScrollReveal>
        ))}
        <ScrollReveal delay={categories.length * 0.08}>
          <div className="relative flex aspect-[.9] flex-col justify-end overflow-hidden p-7">
            <Image src="/imagens/merano-assets/banner-paisagem.png" alt="Paisagem brasileira, próxima coleção Merano" fill className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-black/35" />
            <span className="sans relative z-10 text-[10px] uppercase tracking-[.14em] text-white/80">Em breve</span>
            <h2 className="relative z-10 mt-2 text-3xl text-white">Próxima coleção</h2>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </main>;
}
