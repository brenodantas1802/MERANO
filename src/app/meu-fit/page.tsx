import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MeuFitForm } from "@/components/meu-fit-form";
import { SizeChart } from "@/components/size-chart";

const steps = [
  { title: "Busto", text: "Passe a fita métrica ao redor da parte mais larga do busto, mantendo-a paralela ao chão." },
  { title: "Ombro a ombro", text: "Meça a distância entre as pontas dos ombros, passando pelas costas." },
  { title: "Comprimento", text: "Da base do pescoço até onde você quer que a peça termine." },
  { title: "Postura", text: "Fique em pé, relaxado, sem prender a respiração — a medida precisa refletir seu corpo em repouso." },
];

export default function MeuFitPage() {
  return <main>
    <SiteHeader />

    <ScrollReveal className="relative flex h-[70vh] min-h-[420px] w-full items-center overflow-hidden">
      <video src="/imagens/merano-assets/mar-2-web.mp4" autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/40" />
      <Link href="/" className="sans absolute left-6 top-6 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-white/80 md:left-12 md:top-8"><ArrowLeft size={14} /> Voltar para o início</Link>
      <div className="relative z-10 px-6 text-white md:px-12">
        <p className="sans mb-4 text-[10px] uppercase tracking-[.2em] text-white/80">Meu Merano Fit</p>
        <h1 className="display text-6xl md:text-8xl">Suas medidas,<br /><i>guardadas.</i></h1>
        <p className="mt-6 max-w-xl text-xl text-white/90">Salve suas medidas uma vez e a gente recomenda o tamanho certo sempre que você voltar.</p>
      </div>
    </ScrollReveal>

    <div className="mx-auto max-w-360 px-6 pb-28 pt-16 md:px-12">
      <div className="grid gap-16 md:grid-cols-[1fr_1fr] md:gap-24">
        <ScrollReveal><p className="sans mb-6 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Suas medidas</p><MeuFitForm /></ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="sans mb-6 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Como tirar suas medidas</p>
          <div className="space-y-6">
            {steps.map((step, index) => <div key={step.title} className="flex gap-4"><span className="display text-2xl text-[var(--areia)]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-lg">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{step.text}</p></div></div>)}
          </div>
          <div className="mt-10 border-t border-[var(--line)] pt-6">
            <p className="sans mb-2 text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">Recomendação de sobra</p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">Peças sob medida saem com folga de 1 a 2 cm além da sua medida real, para garantir conforto e espaço para pequenos ajustes. Se você estiver entre dois tamanhos, prefira o maior.</p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-24 border-t border-[var(--line)] pt-14"><p className="sans mb-6 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Tabela de medidas geral</p><SizeChart /></ScrollReveal>

      <ScrollReveal delay={0.1} className="mt-24 bg-[var(--areia)]/20 p-8 md:p-12">
        <p className="sans mb-3 text-[10px] uppercase tracking-[.2em] text-[var(--terra-dark)]">Em breve, dentro do Meu Merano Fit</p>
        <h2 className="text-3xl">Provador virtual em 3D.</h2>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">Um manequim virtual vestindo suas medidas, mostrando como cada peça cai no seu corpo antes da compra. Estamos reunindo os dados para calibrar essa experiência — assim que estiver pronta, ela aparece aqui.</p>
        <Link href="/provador-3d" className="sans mt-6 inline-flex items-center gap-2 border-2 border-[var(--terra-dark)] px-5 py-2.5 text-[11px] uppercase tracking-[.15em] text-[var(--terra-dark)]">Ver contagem regressiva <ArrowUpRight size={14} /></Link>
      </ScrollReveal>
    </div>
  </main>;
}
