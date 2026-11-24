import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FaqAccordion } from "@/components/faq-accordion";
import { PillLink } from "@/components/ui/pill-link";

const steps = [
  { n: "01", title: "Você escolhe", text: "Você escolhe a estampa e o tamanho na página do produto. O Meranno Fit ajuda a acertar o tamanho." },
  { n: "02", title: "A gente separa", text: "Assim que o pagamento é confirmado, a sua peça é conferida e embalada com cuidado." },
  { n: "03", title: "A peça encontra você", text: "O pedido segue para envio e o código de rastreio chega direto no seu e-mail." },
];

const faqs = [
  { question: "Quanto tempo leva a entrega?", answer: "O prazo do transporte aparece no pagamento, calculado pelo seu CEP, junto com o valor do frete." },
  { question: "Posso acompanhar o andamento do meu pedido?", answer: "Sim. Você recebe o código de rastreio por e-mail assim que o pedido for despachado." },
  { question: "E se eu precisar trocar o tamanho depois?", answer: "Não fazemos trocas. Por isso a tabela de medidas e o Meranno Fit estão em cada peça: confira antes de comprar." },
];

// The owners' text (2026-11-23), word for word. The shirts that turned with the scroll (ShirtChapters) left this page
// on 2026-11-22: heavy on phones, and the owners prefer the page short.
const ABERTURA = "A Meranno nasceu da ideia de que vestir-se é mais do que escolher uma roupa: é uma forma de expressar quem somos.";
const HISTORIA = [
  "Acreditamos em uma moda que valoriza a autenticidade, a criatividade e a individualidade. Por isso, desenvolvemos coleções que combinam identidade, estilo e originalidade, com estampas que contam histórias e traduzem diferentes formas de enxergar o mundo.",
  "Mas queremos ir além das nossas próprias criações.",
  "Com nosso provador virtual e sistema de personalização, oferecemos a liberdade de transformar ideias em peças únicas. Cada pessoa pode criar sua própria estampa, explorando possibilidades e desenvolvendo algo que realmente represente seu estilo.",
  "Mais do que uma marca de roupas, a Meranno é um espaço para a expressão individual, onde a criatividade não se limita às nossas coleções.",
];

export default function BrandPage() {
  return <main><SiteHeader />
    <article className="mx-auto max-w-360 px-6 pb-16 max-md:pt-8 md:px-12 md:pb-20">
      {/* On phones the header's own "Voltar para o início" sits just above, so this one is for wider screens. */}
      <Link href="/" className="sans mb-16 flex items-center gap-2 pt-8 text-[11px] uppercase tracking-[.15em] text-[var(--muted)] max-md:hidden"><ArrowLeft size={14} /> Voltar para o início</Link>

      <ScrollReveal><p className="serif-note text-2xl text-[var(--sol-1)] md:text-3xl">quem a gente é</p><h1 className="display mt-3 max-w-4xl text-7xl md:text-9xl">Sobre <i>nós.</i></h1></ScrollReveal>

      <div className="mt-12 max-w-2xl md:mt-16">
        <p className="text-2xl leading-snug md:text-3xl">{ABERTURA}</p>
        {HISTORIA.map((paragrafo) => <p key={paragrafo} className="mt-6 text-lg leading-relaxed text-[var(--muted)] md:text-xl">{paragrafo}</p>)}
        <p className="display mt-12 text-4xl leading-tight md:text-5xl">Meranno. <i>Vista suas ideias.</i></p>
      </div>
    </article>

    {/* 2026-11-17: the sea banner, the beach photo ("Um Brasil sem filtro"), the old linen label and the 7-day lead
        time were taken out at the owners' request (the beach no longer fits; new label and lead time to come). The
        "Feito sob demanda" block went too: the owners stopped making to order (pieces now come from stock). */}
    <article className="mx-auto max-w-360 px-6 pb-28 pt-10 md:px-12">
      <div id="como-funciona">
        <div className="border-t border-[var(--line)] pt-14">
          <ScrollReveal><p className="sans mb-10 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Como funciona</p></ScrollReveal>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => <ScrollReveal key={step.n} delay={index * 0.1}><span className="display text-5xl text-[var(--muted)]">{step.n}</span><h3 className="mt-4 text-2xl">{step.title}</h3><p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">{step.text}</p></ScrollReveal>)}
          </div>
        </div>

        <div className="mt-24 border-t border-[var(--line)] pt-14">
          <ScrollReveal><p className="sans mb-10 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Perguntas frequentes</p></ScrollReveal>
          <ScrollReveal delay={0.05}><FaqAccordion items={faqs} /></ScrollReveal>
        </div>
      </div>

      <ScrollReveal delay={0.1} className="mt-24 flex flex-col items-start gap-6 border-t border-[var(--line)] pt-14 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-2xl leading-snug">Escolha a sua peça ou crie a sua estampa.</p>
        <div className="flex flex-wrap gap-3"><PillLink href="/shop">Ver coleção</PillLink><PillLink href="/personalizar-estampa">Criar a minha</PillLink></div>
      </ScrollReveal>
    </article>
  </main>;
}
