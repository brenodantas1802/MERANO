import Link from "next/link";
import { products } from "@/lib/products";
import { SiteHeader } from "@/components/site-header";
import { HeroTopo } from "@/components/hero-topo";
import { SeasonShirt } from "@/components/season-shirt";
import { ProductShelf } from "@/components/product-shelf";
import Image from "next/image";


export default function Home() {
  return <main>
    <SiteHeader overlay />

    <HeroTopo />

    <ProductShelf id="lancamento" numero="01" titulo="Lançamento" verTudo="/shop" products={products.filter((product) => product.lancamento)} />

    <SeasonShirt products={products} />

    {/* Editorial banner: the Personalizador */}
    <section className="px-1 pt-12 md:pt-16">
      <Link href="/personalizar-estampa" className="group relative block aspect-[4/5] overflow-hidden md:aspect-[21/9]">
        <Image src="/imagens/merano-assets/foto praia 1.jpg" alt="" fill sizes="100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(85,30,43,.85)] via-[rgba(85,30,43,.15)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
          <p className="label text-[12px] text-[var(--latao)]">Novo · Personalizador</p>
          <h2 className="display mt-2 text-[clamp(2.6rem,9vw,5.5rem)]">A sua estampa.</h2>
          <span className="press mt-5 inline-flex h-11 items-center rounded-full bg-[var(--creme)] px-6 text-[13px] font-medium text-[var(--vinho)]">Criar agora</span>
        </div>
      </Link>
    </section>
  </main>;
}
