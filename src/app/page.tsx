import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { HeroVideo } from "@/components/hero-video";
import { HeroTextReveal } from "@/components/hero-text-reveal";
import { PillLink } from "@/components/ui/pill-link";
import { SeasonShirt } from "@/components/season-shirt";
import { Lookbook } from "@/components/lookbook";


export default function Home() {
  return <main>
    <SiteHeader overlay />

    <section className="relative overflow-hidden px-7 py-10 text-white md:px-16 md:py-16">
      <HeroVideo src="/imagens/merano-assets/banner-mar-4.mp4" poster="/imagens/merano-assets/banner-mar-4-poster.jpg" />
      {/* Shade weighted to the side the headline sits on, so the type reads over bright surf without dimming the whole sea. */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,24,30,.62)_0%,rgba(6,24,30,.34)_42%,rgba(6,24,30,.08)_72%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(6,24,30,.35)] to-transparent" />
      <div className="relative z-10 flex min-h-screen flex-col justify-center">
        <div className="max-w-3xl"><HeroTextReveal className="display max-w-3xl text-[clamp(2.8rem,7vw,6.4rem)] [text-shadow:0_2px_36px_rgba(4,18,24,.35)]" lines={["Feito para", "quem entende", <span key="excl" className="hero-accent">exclusividade.</span>]} /></div>
        <div className="mt-10"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink></div>
      </div>
    </section>

    <SeasonShirt products={products} />

    <section id="colecao" className="pb-12 pt-14 md:pb-16 md:pt-20">
      <div className="mb-6 flex items-end justify-between px-6 md:px-12"><h2 className="label text-[13px]">Coleção 01</h2><Link href="/shop" className="label text-[12px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Ver tudo</Link></div>
      <div className="grid grid-cols-2 gap-1 px-1 md:grid-cols-3">{products.slice(0, 6).map((product) => <ProductCard product={product} key={product.id} />)}</div>
    </section>

    <Lookbook />

  </main>;
}
