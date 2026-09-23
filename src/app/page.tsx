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

    <section id="colecao" className="mx-auto max-w-360 px-6 py-28 md:px-12 md:py-40">
      <ScrollReveal className="mb-16 flex items-end justify-between"><div><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">New in · A primeira coleção</p><h2 className="display text-5xl md:text-7xl">O começo<br /><i>é agora.</i></h2></div><NoiseBackground gradientColors={MERANO_GRADIENT} containerClassName="hidden w-fit rounded-full bg-[var(--areia)]/15 p-0 shadow-none md:inline-flex dark:bg-[var(--areia)]/15"><Link href="/shop" className="sans flex items-center justify-center gap-2 rounded-full border-2 border-[var(--ink)] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[.15em]">Shop now <ArrowUpRight size={14} /></Link></NoiseBackground></ScrollReveal>
      <div className="grid gap-8 md:grid-cols-3 md:gap-x-10 md:gap-y-16">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
    </section>

    <section id="feito" className="grain grid gap-16 px-6 py-28 md:grid-cols-[1fr_1.15fr] md:gap-20 md:px-24 md:py-40">
      <ScrollReveal><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Feito sob demanda</p><h2 className="display max-w-xl text-5xl md:text-7xl">Menos excesso.<br /><i>Mais presença.</i></h2><Image src="/imagens/merano-assets/etiqueta-linho.png" alt="Etiqueta de linho Merano" width={420} height={520} className="mt-10 h-56 w-full object-cover md:h-72" /></ScrollReveal>
      <ScrollReveal className="max-w-xl self-end" delay={0.1}><p className="text-2xl leading-snug md:text-3xl">Cada peça começa depois que você escolhe. Assim, a gente produz apenas o que encontra um corpo para vestir.</p><div className="mt-16 grid grid-cols-2 gap-8 border-t border-[var(--line)] pt-5 sans text-[11px] uppercase tracking-[.11em]"><span>01 — Você escolhe</span><span>02 — A gente produz</span><span>03 — A peça encontra você</span></div></ScrollReveal>
    </section>

    <section id="marca" className="mx-auto grid max-w-360 gap-16 px-6 py-28 md:grid-cols-2 md:gap-20 md:px-24 md:py-40">
      <ScrollReveal><div className="relative min-h-80 overflow-hidden"><Image src="/imagens/merano-assets/logo-relevo-papel.png" alt="Logo Merano em relevo sobre papel" fill className="object-cover" /></div><span className="sans mt-4 block text-[10px] uppercase tracking-[.18em] text-[var(--muted)]">Nascida entre cidade e natureza</span></ScrollReveal>
      <ScrollReveal className="flex flex-col justify-between" delay={0.1}><div><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Sobre a Merano</p><p className="text-3xl leading-tight md:text-5xl">Uma marca brasileira para quem percebe que vestir também é uma forma de pertencer.</p></div><Link href="/a-marca" className="sans mt-10 flex w-fit items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.16em]">Conhecer a marca <ArrowUpRight size={14} /></Link></ScrollReveal>
    </section>

    <footer className="flex flex-col gap-8 bg-black px-6 py-12 text-white md:flex-row md:items-center md:justify-between md:px-12 md:py-14"><Image src="/imagens/merano-assets/logo-principal.png" alt="Merano" width={120} height={80} className="h-14 w-auto object-contain object-left" /><div className="sans flex flex-wrap gap-5 text-[10px] uppercase tracking-[.15em]"><Link href="/contact">Contato</Link><Link href="/faq">FAQ</Link><Link href="/entrega">Entrega</Link><Link href="/trocas">Trocas</Link><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></div><span className="sans text-[10px] uppercase tracking-[.15em]">Feito para quem entende exclusividade. · © Merano 2026</span></footer>
  </main>;
}
