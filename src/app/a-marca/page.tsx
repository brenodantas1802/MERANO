import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProductCard } from "@/components/product-card";
import { FaqAccordion } from "@/components/faq-accordion";
import { Lens } from "@/components/ui/lens";
import { products } from "@/lib/products";

const steps = [
  { n: "01", title: "Você escolhe", text: "Você seleciona a estampa, a modelagem e a cor na página do produto. Nada é produzido antes disso." },
  { n: "02", title: "A gente produz", text: "Sua peça entra na fila de produção do ateliê. Cortamos, costuramos e finalizamos sob medida de tempo — sem pressa, sem lote parado." },
  { n: "03", title: "A peça encontra você", text: "Assim que pronta, a peça segue para envio com o código de rastreio direto no seu e-mail." },
];

const faqs = [
  { question: "Quanto tempo leva a produção?", answer: "Em média até 7 dias úteis a partir da confirmação do pedido, antes do envio. Esse prazo pode variar um pouco conforme a fila do ateliê e a complexidade da peça." },
  { question: "Por que vocês não têm estoque pronto?", answer: "Produzir sob demanda evita desperdício e estoque parado. Cada peça só existe porque alguém escolheu — isso torna a produção mais consciente e reduz o excesso." },
  { question: "Posso acompanhar o andamento do meu pedido?", answer: "Sim. Assim que a produção começa você recebe atualizações por e-mail, e o código de rastreio chega quando a peça sai do ateliê." },
  { question: "E se eu precisar trocar o tamanho depois?", answer: "Sem problema — aceitamos trocas em até 30 dias após o recebimento, desde que a peça esteja sem uso e com a etiqueta preservada." },
];

export default function BrandPage() {
  return <main><SiteHeader />
    <article className="mx-auto max-w-360 px-6 pb-28 md:px-12">
      <Link href="/" className="sans mb-16 flex items-center gap-2 pt-8 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]"><ArrowLeft size={14} /> Voltar para o início</Link>

      <ScrollReveal><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">A marca</p><h1 className="display max-w-4xl text-7xl md:text-9xl">Sobre a<br /><i>Merano.</i></h1><p className="mt-10 max-w-2xl text-2xl leading-snug md:text-3xl">Uma marca brasileira para quem percebe que vestir também é uma forma de pertencer.</p></ScrollReveal>

      <div className="mt-24 grid gap-16 md:grid-cols-2 md:gap-20">
        <ScrollReveal><Lens zoomFactor={1.6} lensSize={160}><div className="relative aspect-[.9] w-full bg-[var(--cream)]"><Image src="/imagens/merano-assets/logo-relevo-papel.png" alt="Logo Merano em relevo sobre papel, detalhe ampliável" fill className="object-cover" /></div></Lens><p className="sans mt-4 text-[10px] uppercase tracking-[.15em] text-[var(--muted)]">Passe o mouse para ampliar o relevo</p></ScrollReveal>
        <ScrollReveal delay={0.1} className="flex flex-col justify-center gap-8">
          <div><h2 className="text-3xl">Nascida entre cidade e natureza</h2><p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">A Merano nasce do encontro entre corpo, território e tempo — da relação afetiva com a paisagem brasileira, sem pressa e sem excesso. Cada estampa carrega uma referência de lugar: o mar, a terra, os frutos, a gente.</p></div>
          <div><h2 className="text-3xl">Produção consciente</h2><p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">Produzimos sob demanda para evitar estoque parado e aproximar cada peça do corpo que vai recebê-la. Isso significa menos desperdício e mais intenção em cada etapa — do tecido ao acabamento.</p></div>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-24 grid gap-8 border-t border-[var(--line)] pt-14 sans text-sm uppercase tracking-[.1em] text-[var(--muted)] md:grid-cols-3">
        <div className="border-l-2 border-[var(--areia)] pl-5"><p className="text-3xl display normal-case tracking-normal text-[var(--ink)]">01</p><p className="mt-2">Origem brasileira, sem filtros — paisagem, clima e afeto viram estampa.</p></div>
        <div className="border-l-2 border-[var(--areia)] pl-5"><p className="text-3xl display normal-case tracking-normal text-[var(--ink)]">02</p><p className="mt-2">Sob demanda — cada peça começa a existir quando alguém a escolhe.</p></div>
        <div className="border-l-2 border-[var(--areia)] pl-5"><p className="text-3xl display normal-case tracking-normal text-[var(--ink)]">03</p><p className="mt-2">Materiais de toque macio, pensados para durar e envelhecer bem.</p></div>
      </ScrollReveal>

      <div id="new-in" className="mt-28 border-t border-[var(--line)] pt-16">
        <ScrollReveal className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">New in · A primeira coleção</p><h2 className="display text-5xl md:text-7xl">O começo<br /><i>é agora.</i></h2></div>
          <Link href="/shop" className="sans flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.15em]">Ver tudo na loja <ArrowUpRight size={14} /></Link>
        </ScrollReveal>
        <div className="grid gap-8 md:grid-cols-3 md:gap-x-10 md:gap-y-16">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
      </div>
    </article>

    <ScrollReveal className="relative h-[70vh] min-h-[420px] overflow-hidden md:h-[85vh]">
      <Image src="/imagens/merano-assets/foto praia 1.jpg" alt="Corpo em movimento na praia, referência da Merano" fill className="object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="sans mb-4 text-[10px] uppercase tracking-[.2em]" style={{ color: "#FABD4B" }}>Origem</p>
        <p className="display max-w-2xl text-4xl leading-tight md:text-6xl">O mesmo mar que inspira as estampas é o que guia o ritmo com que fazemos cada peça.</p>
      </div>
    </ScrollReveal>

    <article className="mx-auto max-w-360 px-6 pb-28 pt-24 md:px-12">
      <div className="grid gap-16 md:grid-cols-2 md:gap-20">
        <ScrollReveal className="relative aspect-[.9] w-full overflow-hidden"><Image src="/imagens/merano-assets/foto praia 2.jpg" alt="Praia brasileira, referência de paisagem para a Merano" fill className="object-cover" /></ScrollReveal>
        <ScrollReveal delay={0.1} className="flex flex-col justify-center gap-4"><h2 className="text-3xl">Um Brasil sem filtro.</h2><p className="text-lg leading-relaxed text-[var(--muted)]">Não buscamos um Brasil de cartão-postal — buscamos o Brasil que se vive: a maresia, a terra vermelha, a luz baixa do fim de tarde. É esse Brasil que vira estampa, tecido e corte.</p></ScrollReveal>
      </div>

      <div id="sob-demanda" className="mt-28 border-t border-[var(--line)] pt-16">
        <div className="grid gap-16 md:grid-cols-[1fr_1.15fr] md:gap-20">
          <ScrollReveal><p className="sans mb-5 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Feito sob demanda</p><h2 className="display max-w-xl text-5xl md:text-7xl">Menos excesso.<br /><i>Mais presença.</i></h2><Image src="/imagens/merano-assets/etiqueta-linho.png" alt="Etiqueta de linho Merano" width={420} height={520} className="mt-10 h-56 w-full object-cover md:h-72" /></ScrollReveal>
          <ScrollReveal delay={0.1} className="self-end"><p className="text-2xl leading-snug md:text-3xl">Cada peça começa depois que você escolhe. Assim, a gente produz apenas o que encontra um corpo para vestir.</p><p className="sans mt-6 inline-block bg-[var(--areia)] px-4 py-2 text-[10px] uppercase tracking-[.14em] text-[var(--terra-dark)]">Prazo estimado: até 7 dias úteis de produção + envio</p></ScrollReveal>
        </div>

        <div className="mt-24 border-t border-[var(--line)] pt-14">
          <ScrollReveal><p className="sans mb-10 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Como funciona</p></ScrollReveal>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => <ScrollReveal key={step.n} delay={index * 0.1}><span className="display text-5xl text-[var(--areia)]">{step.n}</span><h3 className="mt-4 text-2xl">{step.title}</h3><p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">{step.text}</p></ScrollReveal>)}
          </div>
        </div>

        <div className="mt-24 border-t border-[var(--line)] pt-14">
          <ScrollReveal><p className="sans mb-10 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Perguntas frequentes</p></ScrollReveal>
          <ScrollReveal delay={0.05}><FaqAccordion items={faqs} /></ScrollReveal>
        </div>
      </div>

      <ScrollReveal delay={0.1} className="mt-24 flex flex-col items-start gap-6 border-t border-[var(--line)] pt-14 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-2xl leading-snug">Pronta para escolher a sua peça?</p>
        <Link href="/shop" className="sans flex w-fit items-center gap-2 border-b border-[var(--ink)] pb-2 text-[11px] uppercase tracking-[.16em]">Ver coleção <ArrowUpRight size={14} /></Link>
      </ScrollReveal>
    </article>
  </main>;
}
