import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { HeroTopo } from "@/components/hero-topo";
import { SeasonShirt } from "@/components/season-shirt";
import { Lookbook } from "@/components/lookbook";
import { ProductShelf } from "@/components/product-shelf";
import Image from "next/image";


export default function Home() {
  return <main>
    <SiteHeader overlay />

    <HeroTopo />

    <ProductShelf numero="01" titulo="Mais desejadas" verTudo="/shop" products={products.slice(0, 8)} />

    <SeasonShirt products={products} />

    {/* Editorial banner: the Personalizador */}
    <section className="px-1 pt-12 md:pt-16">
      <Link href="/personalizar-estampa" className="group relative block aspect-[4/5] overflow-hidden md:aspect-[21/9]">
        <Image src="/imagens/merano-assets/lookbook/modelo-preta-vermelha.webp" alt="" fill sizes="100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(85,30,43,.85)] via-[rgba(85,30,43,.15)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
          <p className="label text-[12px] text-[var(--latao)]">Novo · Personalizador</p>
          <h2 className="display mt-2 text-[clamp(2.6rem,9vw,5.5rem)]">A sua estampa.</h2>
          <span className="press mt-5 inline-flex h-11 items-center rounded-full bg-[var(--creme)] px-6 text-[13px] font-medium text-[var(--vinho)]">Criar agora</span>
        </div>
      </Link>
    </section>

    <section id="colecao" className="pb-12 pt-14 md:pb-16 md:pt-20">
      <div className="mb-6 flex items-end justify-between px-6 md:px-12"><h2 className="secao"><b>02 /</b>Coleção 01</h2><Link href="/shop" className="label inline-flex min-h-11 items-center text-[12px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Ver tudo</Link></div>
      <div className="grid grid-cols-2 gap-1 px-1 md:grid-cols-3">{products.slice(0, 6).map((product) => <ProductCard product={product} key={product.id} />)}</div>
    </section>

    <Lookbook />

  </main>;
}
