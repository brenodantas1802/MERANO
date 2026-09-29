import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroVideo } from "@/components/hero-video";
import { HeroTextReveal } from "@/components/hero-text-reveal";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Doodle, Marquee } from "@/components/doodle";

const MERANO_GRADIENT = ["#F37C22", "#FABD4B", "#C7BAA7"];

export default function Home() {
  return <main>
    <SiteHeader />

    <section className="relative overflow-hidden px-7 py-10 text-white md:px-16 md:py-16">
      <HeroVideo src="/imagens/merano-assets/banner-mar-4.mp4" poster="/imagens/merano-assets/banner-mar-4-poster.jpg" />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 flex min-h-screen flex-col justify-center">
        <div className="max-w-3xl"><HeroTextReveal className="display max-w-3xl text-[clamp(2.6rem,6.5vw,5.8rem)]" lines={["Feito para", "quem entende", <i key="excl">exclusividade.</i>]} /></div>
        <div className="mt-10"><NoiseBackground gradientColors={MERANO_GRADIENT} containerClassName="w-fit rounded-full bg-[var(--creme)]/10 shadow-none dark:bg-[var(--creme)]/10"><a href="#colecao" className="sans flex items-center justify-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[.16em]">Ver coleção <ArrowUpRight size={14} /></a></NoiseBackground></div>
      </div>
    </section>

    <Marquee items={["Feito sob demanda", "Moda brasileira", "Coleção 01", "Feito para quem entende exclusividade"]} />

    <section id="colecao" className="mx-auto max-w-360 px-6 py-28 md:px-12 md:py-40">
      <ScrollReveal className="mb-16 flex items-end justify-between"><div><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Novidades · A primeira coleção</p><div className="relative w-fit"><h2 className="display text-5xl md:text-7xl">O começo<br /><i>é agora.</i></h2><Doodle name="sun" className="absolute -right-14 -top-6 h-12 w-12 text-[var(--sol-1)] md:-right-20 md:h-16 md:w-16" /><span className="script absolute -bottom-9 right-0 rotate-[-4deg] text-2xl text-[var(--terra)] md:-right-24 md:bottom-2">coleção 01</span></div></div><NoiseBackground gradientColors={MERANO_GRADIENT} containerClassName="hidden w-fit rounded-full bg-[var(--areia)]/15 p-0 shadow-none md:inline-flex dark:bg-[var(--areia)]/15"><Link href="/shop" className="sans flex items-center justify-center gap-2 rounded-full border-2 border-[var(--ink)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[.15em]">Ver loja <ArrowUpRight size={14} /></Link></NoiseBackground></ScrollReveal>
      <div className="grid gap-8 md:grid-cols-3 md:gap-x-10 md:gap-y-16">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
    </section>

    <section id="feito" className="grain grid gap-16 px-6 py-28 md:grid-cols-[1fr_1.15fr] md:gap-20 md:px-24 md:py-40">
      <ScrollReveal><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Feito sob demanda</p><h2 className="display max-w-xl text-5xl md:text-7xl">Menos excesso.<br /><i>Mais presença.</i></h2><Image src="/imagens/merano-assets/etiqueta-linho.jpg" alt="Etiqueta de linho Merano" width={420} height={520} className="mt-10 h-56 w-full object-cover md:h-72" /></ScrollReveal>
      <ScrollReveal className="max-w-xl self-end" delay={0.1}><p className="text-2xl leading-snug md:text-3xl">Cada peça começa depois que você escolhe. Assim, a gente produz apenas o que encontra um corpo para vestir.</p><div className="mt-16 grid grid-cols-3 gap-6 border-t border-[var(--ink)]/30 pt-6">{([["branch", "01", "Você escolhe"], ["sun", "02", "A gente produz"], ["boat", "03", "A peça encontra você"]] as const).map(([doodle, n, text], index) => <div key={n}><Doodle name={doodle} className="h-14 w-16 text-[var(--terra)]" delay={index * 0.25} /><p className="sans mt-3 text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">{n}</p><p className="mt-1 text-lg leading-tight">{text}</p></div>)}</div></ScrollReveal>
    </section>

    <section id="marca" className="mx-auto grid max-w-360 gap-16 px-6 py-28 md:grid-cols-2 md:gap-20 md:px-24 md:py-40">
      <ScrollReveal><div className="relative min-h-80 overflow-hidden"><Image src="/imagens/merano-assets/logo-relevo-papel.jpg" alt="Logo Merano em relevo sobre papel" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div><div className="mt-4 flex items-center justify-between gap-4"><span className="sans text-[10px] uppercase tracking-[.18em] text-[var(--muted)]">Nascida entre cidade e natureza</span><Doodle name="wave" className="h-5 w-28 text-[var(--moss)]" /></div></ScrollReveal>
      <ScrollReveal className="flex flex-col justify-between" delay={0.1}><div><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Sobre a Merano</p><p className="text-3xl leading-tight md:text-5xl">Uma marca brasileira para quem percebe que vestir também é uma forma de pertencer.</p><p className="script mt-8 -rotate-2 text-3xl text-[var(--terra)]">good people, better places.</p></div><Link href="/a-marca" className="sans mt-10 flex w-fit items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.16em]">Conhecer a marca <ArrowUpRight size={14} /></Link></ScrollReveal>
    </section>

  </main>;
}
