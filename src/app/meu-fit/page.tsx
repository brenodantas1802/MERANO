import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MeuFitForm } from "@/components/meu-fit-form";
import { SizeChart } from "@/components/size-chart";
import { MeasureDiagram } from "@/components/measure-diagram";
import { SeaWaves } from "@/components/beach-art";
import { Illustration } from "@/components/illustration";

const steps = [
  { title: "Busto", text: "Passe a fita ao redor da parte mais larga do peito, paralela ao chão, sem apertar." },
  { title: "Ombro a ombro", text: "Meça pelas costas, da ponta de um ombro até a ponta do outro." },
  { title: "Comprimento", text: "Da base do pescoço até onde você quer que a camiseta termine." },
  { title: "Postura", text: "Em pé e relaxado, sem prender a respiração: a medida é do corpo em repouso." },
];

export default function MeuFitPage() {
  return <main>
    <SiteHeader />

    <section className="grain relative overflow-hidden">
      <div className="mx-auto grid max-w-360 items-center gap-10 px-6 py-16 md:grid-cols-[1.1fr_.9fr] md:px-12 md:py-24">
        <ScrollReveal>
          <p className="script mb-3 text-4xl text-[var(--sol-1)]">meu merano fit</p>
          <h1 className="display text-6xl md:text-8xl">Seu tamanho,<br /><i>sem achismo.</i></h1>
          <p className="mt-8 max-w-md text-xl leading-snug">Três medidas, uma fita métrica e dois minutos. A gente guarda e já deixa o seu tamanho marcado em cada peça da loja.</p>
          <p className="script mt-8 -rotate-2 text-3xl text-[var(--terra)]">pega a fita, a gente espera.</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="relative">
          {/* Warm disc of light behind the shirt. */}
          <div aria-hidden className="absolute left-1/2 top-[42%] -z-0 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(250,189,75,.38)_0%,rgba(250,189,75,.12)_45%,rgba(250,189,75,0)_70%)]" />
          <MeasureDiagram className="relative" />
        </ScrollReveal>
      </div>
      <SeaWaves />
    </section>

    <div className="mx-auto max-w-360 px-6 pb-28 pt-20 md:px-12">
      <div className="grid gap-16 md:grid-cols-[1fr_1fr] md:gap-24">
        <ScrollReveal>
          <h2 className="display text-4xl md:text-5xl">Suas medidas.</h2>
          <p className="mb-8 mt-3 text-[var(--muted)]">Ficam salvas só neste navegador.</p>
          <MeuFitForm />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="display text-4xl md:text-5xl">Como medir.</h2>
          <ol className="mt-8 space-y-7">
            {steps.map((step, index) => <li key={step.title} className="flex gap-5"><span className="display flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--ink)] text-xl italic">{index + 1}</span><div><h3 className="text-xl">{step.title}</h3><p className="mt-1 leading-relaxed text-[var(--muted)]">{step.text}</p></div></li>)}
          </ol>
          <p className="mt-10 border-l-2 border-[var(--sol-1)] pl-5 leading-relaxed text-[var(--muted)]">Nossas camisetas têm modelagem ampla. Se ficar entre dois tamanhos, prefira o maior para um caimento mais solto.</p>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-24 border-t border-[var(--ink)]/30 pt-14"><div className="mb-8 flex items-end justify-between gap-6"><h2 className="display text-4xl md:text-5xl">Tabela de medidas.</h2><Illustration name="barco" className="hidden w-36 md:block" /></div><SizeChart /></ScrollReveal>

      <ScrollReveal delay={0.1} className="mt-24 flex flex-col items-start justify-between gap-8 bg-[var(--terra-dark)] p-8 text-[var(--creme)] md:flex-row md:items-center md:p-12">
        <div><p className="script mb-2 -rotate-1 text-2xl text-[var(--sol-2)]">quer ver antes de comprar?</p><h2 className="display text-4xl md:text-5xl">Experimente no Provador virtual.</h2><p className="mt-3 max-w-xl text-[var(--creme)]/75">Envie uma foto sua, escolha a estampa e veja você vestindo a peça.</p></div>
        <Link href="/provador" className="sans inline-flex shrink-0 items-center gap-2 bg-[var(--creme)] px-6 py-3.5 text-[11px] uppercase tracking-[.15em] text-[var(--terra-dark)] transition-opacity hover:opacity-85">Abrir provador <ArrowUpRight size={14} /></Link>
      </ScrollReveal>
    </div>
  </main>;
}
