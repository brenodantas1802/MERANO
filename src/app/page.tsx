import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return <main>
    <SiteHeader />

    <section className="relative mx-3 min-h-[620px] overflow-hidden px-7 py-10 text-white md:mx-6 md:min-h-[680px] md:px-16 md:py-16">
      <Image src="/imagens/merano-assets/banner-paisagem.png" alt="Paisagem brasileira ao entardecer" fill priority sizes="(max-width: 768px) 100vw, 96vw" className="object-cover" />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 flex h-full min-h-[550px] flex-col justify-between">
        <div className="sans flex items-start justify-between text-[10px] uppercase tracking-[.19em]"><span>Pré-lançamento · Brasil</span><span className="hidden md:block">Coleção 01 / 2026</span></div>
        <div className="max-w-3xl fade-up"><p className="sans mb-6 text-[11px] uppercase tracking-[.22em]">Peças para o corpo que habita o mundo</p><h1 className="display max-w-3xl text-[clamp(4.7rem,13vw,11.5rem)]">Sol.<br />Terra.<br /><i>Gente.</i></h1></div>
        <div className="flex items-end justify-between"><p className="max-w-xs text-lg leading-snug md:text-xl">Roupas feitas com tempo, intenção e espaço para você.</p><a href="#colecao" className="sans flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.16em]">Ver coleção <ArrowUpRight size={14} /></a></div>
      </div>
    </section>

    <section id="colecao" className="mx-auto max-w-360 px-6 py-24 md:px-12 md:py-32"><div className="mb-12 flex items-end justify-between"><div><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">New in · A primeira coleção</p><h2 className="display text-5xl md:text-7xl">O começo<br /><i>é agora.</i></h2></div><Link href="/produtos" className="sans hidden items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.15em] md:flex">Shop now <ArrowUpRight size={14} /></Link></div><div className="grid gap-8 md:grid-cols-3">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div></section>

    <section id="feito" className="grain grid gap-12 px-6 py-24 md:grid-cols-[1fr_1.15fr] md:px-24 md:py-32"><div><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Feito sob demanda</p><h2 className="display max-w-xl text-5xl md:text-7xl">Menos excesso.<br /><i>Mais presença.</i></h2><Image src="/imagens/merano-assets/etiqueta-linho.png" alt="Etiqueta de linho Merano" width={420} height={520} className="mt-10 h-56 w-full object-cover md:h-72" /></div><div className="max-w-xl self-end"><p className="text-2xl leading-snug md:text-3xl">Cada peça começa depois que você escolhe. Assim, a gente produz apenas o que encontra um corpo para vestir.</p><div className="mt-14 grid grid-cols-2 gap-8 border-t border-[var(--line)] pt-5 sans text-[11px] uppercase tracking-[.11em]"><span>01 — Você escolhe</span><span>02 — A gente produz</span><span>03 — A peça encontra você</span></div></div></section>

    <section id="marca" className="mx-auto grid max-w-360 gap-12 px-6 py-24 md:grid-cols-2 md:px-24 md:py-32"><div className="relative min-h-80 overflow-hidden"><Image src="/imagens/merano-assets/logo-relevo-papel.png" alt="Logo Merano em relevo sobre papel" fill className="object-cover" /><span className="sans absolute bottom-7 left-7 text-[10px] uppercase tracking-[.18em]">Nascida entre cidade e natureza</span></div><div className="flex flex-col justify-between"><div><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Sobre a Merano</p><p className="text-3xl leading-tight md:text-5xl">Uma marca brasileira para quem percebe que vestir também é uma forma de pertencer.</p></div><Link href="/privacidade" className="sans mt-10 flex w-fit items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.16em]">Privacidade <ArrowUpRight size={14} /></Link></div></section>

    <footer className="flex flex-col gap-6 bg-[var(--ink)] px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:px-12"><Image src="/imagens/merano-assets/logo-principal.png" alt="Merano" width={120} height={80} className="h-14 w-auto object-contain object-left" /><div className="sans flex flex-wrap gap-5 text-[10px] uppercase tracking-[.15em]"><Link href="/contact">Contato</Link><Link href="/faq">FAQ</Link><Link href="/entrega">Entrega</Link><Link href="/trocas">Trocas</Link><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></div><span className="sans text-[10px] uppercase tracking-[.15em]">Sol. Terra. Gente. Sempre. · © Merano 2026</span></footer>
  </main>;
}
