import Image from "next/image";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroVideo } from "@/components/hero-video";
import { HeroTextReveal } from "@/components/hero-text-reveal";
import { PillLink } from "@/components/ui/pill-link";
import { Illustration } from "@/components/illustration";
import { SeasonShirt } from "@/components/season-shirt";
import { Lookbook } from "@/components/lookbook";
import { RevealHeading } from "@/components/reveal-heading";


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
        <p className="mt-6 max-w-md text-lg leading-snug text-white/90 [text-shadow:0_1px_18px_rgba(4,18,24,.45)] md:text-xl">Moda brasileira feita sob demanda, entre a cidade e o mar.</p>
        <div className="mt-10"><PillLink href="#colecao" variant="glass">Ver coleção</PillLink></div>
      </div>
    </section>

    <SeasonShirt products={products} />

    <section id="colecao" className="mx-auto max-w-360 px-6 pb-12 pt-24 md:px-12 md:pb-16 md:pt-36">
      <ScrollReveal className="mb-16 flex items-end justify-between"><div><div className="relative w-fit"><RevealHeading className="display text-5xl md:text-7xl" lines={["O começo", <i key="a">é agora.</i>]} /><Illustration name="laranjeira" className="absolute -right-20 -top-12 w-20 rotate-12 md:-right-36 md:-top-16 md:w-32" /><span className="serif-note absolute -bottom-9 right-0 text-xl text-[var(--terra)] md:-right-24 md:bottom-2">coleção 01</span></div></div><PillLink href="/shop" className="hidden md:inline-flex">Ver loja</PillLink></ScrollReveal>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-10 md:gap-y-16">{products.slice(0, 6).map((product) => <ProductCard product={product} key={product.id} />)}</div>
      <div className="mt-12 flex justify-center"><PillLink href="/shop">Ver todas as peças</PillLink></div>
    </section>

    <Lookbook />

    <section id="feito" className="grain grid gap-16 px-6 py-28 md:grid-cols-[1fr_1.15fr] md:gap-20 md:px-24 md:py-40">
      <ScrollReveal><RevealHeading className="display max-w-xl text-5xl md:text-7xl" lines={["Menos excesso.", <i key="p">Mais presença.</i>]} /><Image src="/imagens/merano-assets/etiqueta-linho.jpg" alt="Etiqueta de linho Merano" width={420} height={520} className="mt-10 h-56 w-full object-cover md:h-72" /></ScrollReveal>
      <ScrollReveal className="max-w-xl self-end" delay={0.1}><p className="text-2xl leading-snug md:text-3xl">Cada peça começa depois que você escolhe. Assim, a gente produz apenas o que encontra um corpo para vestir.</p><div className="mt-16 grid grid-cols-3 items-end gap-6 border-t border-[var(--ink)]/30 pt-8">{([["laranjeira", "Você escolhe"], ["cafe", "A gente produz"], ["barco", "A peça encontra você"]] as const).map(([art, text], index) => <div key={text}><div className="flex h-28 items-end md:h-36"><Illustration name={art} delay={index * 0.2} className={{ laranjeira: "w-24 md:w-32", cafe: "w-20 md:w-28", barco: "w-full max-w-44" }[art]} /></div><p className="mt-4 text-lg leading-tight">{text}</p></div>)}</div></ScrollReveal>
    </section>

    <section id="marca" className="mx-auto grid max-w-360 gap-16 px-6 py-28 md:grid-cols-2 md:gap-20 md:px-24 md:py-40">
      <ScrollReveal><div className="relative min-h-80 overflow-hidden"><Image src="/imagens/merano-assets/logo-relevo-papel.jpg" alt="Logo Merano em relevo sobre papel" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div><div className="mt-5 flex items-center justify-between gap-4"><span className="serif-note text-xl text-[var(--terra)]">nascida entre cidade e natureza</span><Illustration name="barco" className="w-28 md:w-36" /></div></ScrollReveal>
      <ScrollReveal className="flex flex-col justify-between" delay={0.1}><div><p className="text-3xl leading-tight md:text-5xl">Uma marca brasileira para quem percebe que vestir também é uma forma de pertencer.</p><p className="serif-note mt-8 text-2xl text-[var(--terra)]">good people, better places.</p></div><PillLink href="/sobre-nos" className="mt-10">Sobre nós</PillLink></ScrollReveal>
    </section>

  </main>;
}
