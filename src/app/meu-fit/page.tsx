"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { FitFigure } from "@/components/fit-figure";
import { MeasureDiagram } from "@/components/measure-diagram";
import { SizeChart } from "@/components/size-chart";
import { ProductCard } from "@/components/product-card";
import { PillLink } from "@/components/ui/pill-link";
import { ShirtFan } from "@/components/try-on-visuals";
import { measure, RANGES, useBodyProfile, type ProfileField } from "@/lib/body-profile";
import { recommendSize } from "@/lib/size-recommendation";
import { bodyModel, fitNote } from "@/lib/body-model";
import { useOrders } from "@/lib/orders";
import { currentImage, formatPrice, SIZE_CHART, similarProducts } from "@/lib/products";

type FieldSpec = { field: ProfileField; label: string; unit: string; hint: string };
const EASE = [0.22, 1, 0.36, 1] as const;

const ESSENTIALS: FieldSpec[] = [
  { field: "altura", label: "Altura", unit: "cm", hint: "Descalço, encostado na parede." },
  { field: "peso", label: "Peso", unit: "kg", hint: "Só pra calibrar o caimento." },
  { field: "busto", label: "Busto / tórax", unit: "cm", hint: "Na parte mais larga do peito." },
  { field: "cintura", label: "Cintura", unit: "cm", hint: "Na linha do umbigo, relaxado." },
  { field: "quadril", label: "Quadril", unit: "cm", hint: "Na parte mais larga, pés juntos." },
  { field: "ombro", label: "Ombro a ombro", unit: "cm", hint: "Pelas costas, de ponta a ponta." },
];

const SPECIFICS: FieldSpec[] = [
  { field: "tronco", label: "Tronco", unit: "cm", hint: "Da base do pescoço até a cintura, pelas costas." },
  { field: "braco", label: "Braço", unit: "cm", hint: "Do ombro ao pulso, com o braço relaxado." },
  { field: "entrepernas", label: "Entrepernas", unit: "cm", hint: "Da virilha até o tornozelo, por dentro." },
];
const ALL = [...ESSENTIALS, ...SPECIFICS];

const STEPS = [
  { title: "Busto", text: "Passe a fita ao redor da parte mais larga do peito, paralela ao chão, sem apertar." },
  { title: "Cintura e quadril", text: "Cintura na linha do umbigo; quadril na parte mais larga, com os pés juntos." },
  { title: "Ombro a ombro", text: "Pelas costas, da ponta de um ombro até a ponta do outro." },
  { title: "Postura", text: "Em pé e relaxado, sem prender a respiração: a medida é do corpo em repouso." },
];

function MeasureCard({ spec, value, onChange }: { spec: FieldSpec; value: string; onChange: (value: string) => void }) {
  const [min, max] = RANGES[spec.field];
  const number = Number(value.replace(",", "."));
  const filled = value !== "" && Number.isFinite(number);
  const outOfRange = value !== "" && (!Number.isFinite(number) || number < min || number > max);
  return <label className={`group relative block cursor-text rounded-[1.5rem] p-4 md:rounded-[1.75rem] md:p-5 transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_24px_50px_-34px_rgba(32,28,23,.6)] focus-within:ring-2 focus-within:ring-[var(--ink)] ${filled && !outOfRange ? "bg-white/85 shadow-[0_18px_40px_-34px_rgba(32,28,23,.55)]" : "bg-white/45 ring-1 ring-[var(--ink)]/10"}`}>
    <span className="flex items-center justify-between gap-3">
      <span className="text-[15px] leading-tight md:text-lg">{spec.label}</span>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${filled && !outOfRange ? "scale-100 bg-[var(--sol-1)] text-white" : "scale-75 bg-[var(--ink)]/10 text-transparent"}`}><Check size={13} strokeWidth={2.4} /></span>
    </span>
    <span className="mt-2 flex items-baseline gap-2">
      <input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, "").slice(0, 5))} placeholder="—" aria-label={`${spec.label} em ${spec.unit}`} className="display w-full min-w-0 bg-transparent text-4xl outline-none placeholder:text-[var(--ink)]/20 md:text-5xl" />
      <span className="sans shrink-0 text-sm text-[var(--muted)]">{spec.unit}</span>
    </span>
    <span className={`sans mt-2 block text-[11px] leading-snug md:text-[12px] ${outOfRange ? "text-[#8a3a2c]" : "text-[var(--muted)]"}`}>{outOfRange ? `Confere? Esperávamos entre ${min} e ${max} ${spec.unit}.` : spec.hint}</span>
  </label>;
}

function ProgressRing({ filled, total }: { filled: number; total: number }) {
  const radius = 54;
  const length = 2 * Math.PI * radius;
  const share = filled / total;
  return <div className="relative h-28 w-28 shrink-0 md:h-44 md:w-44">
    <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
      <defs><linearGradient id="ring-sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1B2A41" /><stop offset="1" stopColor="#5d7aa6" /></linearGradient></defs>
      <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--ink)" strokeOpacity={0.08} strokeWidth={7} />
      <motion.circle cx="64" cy="64" r={radius} fill="none" stroke="url(#ring-sun)" strokeWidth={7} strokeLinecap="round" strokeDasharray={length} initial={{ strokeDashoffset: length }} animate={{ strokeDashoffset: length * (1 - share) }} transition={{ duration: 1.1, ease: EASE }} />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="display text-3xl md:text-5xl">{Math.round(share * 100)}%</span>
      <span className="sans mt-1 text-[11px] text-[var(--muted)] md:text-[12px]">{filled} de {total} medidas</span>
    </div>
  </div>;
}

export default function MeranoFitPage() {
  const { profile, update, reset, hasAny } = useBodyProfile();
  const orders = useOrders();
  const [showSpecifics, setShowSpecifics] = useState(false);
  const [view, setView] = useState<"corpo" | "peca">("corpo");
  const recommendation = recommendSize(profile, SIZE_CHART);
  const [previewSize, setPreviewSize] = useState<string | null>(null);
  const shownSize = SIZE_CHART.find((row) => row.size === (previewSize ?? recommendation?.size ?? "M")) ?? SIZE_CHART[2];
  const filled = ALL.filter(({ field }) => measure(profile, field)).length;
  // Same body the figure is drawn from; without a chest (measured or from height and weight) there's nothing to say.
  const note = measure(profile, "busto") || (measure(profile, "altura") && measure(profile, "peso")) ? fitNote(bodyModel(profile), shownSize) : null;

  const boughtIds = [...new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))];
  const suggestions = similarProducts(boughtIds, 3);

  return <main className="season-wash">
    <SiteHeader />

    <section className="mx-auto flex max-w-360 flex-col gap-8 px-6 pb-8 pt-10 md:flex-row md:items-center md:justify-between md:px-12 md:pb-12 md:pt-14">
      <div>
        <h1 className="display text-6xl md:text-7xl">Merano Fit</h1>
        <p className="mt-4 max-w-lg text-lg leading-snug text-[var(--ink)]/75">Suas medidas, uma vez só: a gente marca o seu tamanho em cada peça.</p>
      </div>
      <ProgressRing filled={filled} total={ALL.length} />
    </section>

    <section className="mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)] gap-10 px-6 pb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)] md:gap-14 md:px-12 md:pb-24">
      <div>
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-4xl md:text-5xl">Suas medidas.</h2>
          <a href="#como-medir" className="sans pb-1 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Como medir</a>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">{ESSENTIALS.map((spec) => <MeasureCard key={spec.field} spec={spec} value={profile[spec.field]} onChange={(value) => update(spec.field, value)} />)}</div>

        <button type="button" onClick={() => setShowSpecifics((open) => !open)} aria-expanded={showSpecifics} className="mt-6 flex w-full items-center justify-between rounded-[1.75rem] border border-[var(--ink)]/15 bg-white/30 px-6 py-5 text-left transition-colors hover:bg-white/60">
          <span><span className="display block text-2xl">Medidas finas</span><span className="sans text-[13px] text-[var(--muted)]">Opcional — tronco, braço e entrepernas</span></span>
          <motion.span animate={{ rotate: showSpecifics ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)]"><ChevronDown size={18} strokeWidth={1.6} /></motion.span>
        </button>
        <AnimatePresence initial={false}>
          {showSpecifics && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
            <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">{SPECIFICS.map((spec) => <MeasureCard key={spec.field} spec={spec} value={profile[spec.field]} onChange={(value) => update(spec.field, value)} />)}</div>
          </motion.div>}
        </AnimatePresence>

        <p className="sans mt-6 text-[13px] leading-relaxed text-[var(--muted)]">Ficam salvas neste navegador. {hasAny && <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-[var(--ink)]">Apagar minhas medidas</button>}</p>
      </div>

      <aside className="md:sticky md:top-[calc(var(--header-h,72px)+1.5rem)] md:h-fit">
        <div className="overflow-hidden rounded-[2.5rem] bg-[radial-gradient(90%_60%_at_40%_35%,#2c4166_0%,#1b2a41_55%,#121c2c_100%)] text-[var(--paper)] shadow-[0_40px_80px_-50px_rgba(18,28,44,.9)]">
          <div className="flex flex-wrap items-center justify-end gap-3 px-7 pt-7">
            <div className="sans flex rounded-full bg-white/[.08] p-1 text-[13px] ring-1 ring-white/10" role="tablist" aria-label="Ver no corpo ou só a peça">
              {([["corpo", "No corpo"], ["peca", "A peça"]] as const).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)} className={`relative rounded-full px-4 py-1.5 transition-colors duration-300 ${view === key ? "text-[var(--ink)]" : "text-white/75 hover:text-white"}`}>
                {view === key && <motion.span layoutId="fit-view" className="absolute inset-0 rounded-full bg-[var(--paper)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{label}</span>
              </button>)}
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
              {view === "corpo"
                ? <FitFigure profile={profile} size={shownSize} className="mx-auto -mt-1 h-auto w-full max-w-[440px]" />
                : <div className="px-8 pb-6 pt-10 md:px-12 md:pt-14"><MeasureDiagram size={shownSize.size} /></div>}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-center gap-2 px-6 pb-2" role="group" aria-label="Ver a camiseta em outro tamanho">
            {SIZE_CHART.map((row) => {
              const active = row.size === shownSize.size;
              return <button key={row.size} type="button" onClick={() => setPreviewSize(row.size)} aria-pressed={active} className={`sans relative h-11 w-11 rounded-full text-sm transition-colors duration-300 ${active ? "bg-[var(--paper)] text-[var(--ink)]" : "border border-white/25 text-white/85 hover:border-white/70"}`}>
                {row.size}
                {recommendation?.size === row.size && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--sol-2)] ring-2 ring-[#1b2a41]" aria-label="tamanho recomendado" />}
              </button>;
            })}
          </div>
          <p className="sans pb-6 text-center text-[13px] text-white/75">
            {view === "peca" ? `Peça estendida: ombro ${shownSize.ombro}, busto ${shownSize.largura} e comprimento ${shownSize.comprimento} cm.` : note ? `No ${shownSize.size}, a camiseta ${note}.` : `Toque num tamanho pra ver o caimento${recommendation ? " · o ponto laranja é o seu" : ""}.`}
          </p>

          <div className="m-3 mt-0 flex items-center gap-5 rounded-[2rem] bg-white/[.07] p-5 ring-1 ring-white/10 md:p-6">
            {recommendation ? <>
              <span className="display flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--paper)] text-4xl text-[var(--ink)]">{recommendation.size}</span>
              <div><p className="display text-2xl">Você veste {recommendation.size}.</p><p className="mt-1 text-[15px] leading-snug text-white/75">{recommendation.reason} A gente já deixa marcado em cada peça.</p></div>
            </> : <div><p className="display text-2xl">Falta pouco.</p><p className="mt-1 text-[15px] leading-snug text-white/75">Preencha altura e peso pra uma estimativa, ou o busto pra acertar em cheio.</p></div>}
          </div>
        </div>
      </aside>
    </section>

    <section id="como-medir" className="scroll-mt-24 border-t border-[var(--ink)]/10 bg-[var(--paper)]">
      <div className="mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)] gap-14 px-6 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-20 md:px-12 md:py-20">
        <div>
          <h2 className="display text-4xl md:text-5xl">Como medir.</h2>
          <ol className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {STEPS.map((step, index) => <li key={step.title} className="flex gap-4"><span className="display flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ink)] text-lg italic">{index + 1}</span><div><h3 className="text-xl">{step.title}</h3><p className="mt-1 leading-relaxed text-[var(--muted)]">{step.text}</p></div></li>)}
          </ol>
          <p className="mt-10 border-l-2 border-[var(--sol-1)] pl-5 leading-relaxed text-[var(--muted)]">Nossas camisetas têm modelagem ampla. Se ficar entre dois tamanhos, prefira o maior para um caimento mais solto.</p>
        </div>
        <div>
          <h2 className="display text-4xl md:text-5xl">Tabela de medidas.</h2>
          <div className="mt-8"><SizeChart /></div>
        </div>
      </div>
    </section>

    <section id="pecas" className="scroll-mt-24 bg-[var(--paper)]">
      <div className="mx-auto max-w-360 px-6 pb-20 md:px-12 md:pb-24">
        {orders.length > 0 && <div className="mb-14">
          <h2 className="display text-4xl md:text-6xl">Suas <i>peças.</i></h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{orders.slice(0, 3).flatMap((order) => order.items.map((item) => <div key={`${order.id}-${item.productId}-${item.size}`} className="flex items-center gap-4 rounded-[1.75rem] bg-white/70 p-3 pr-5 shadow-[0_18px_40px_-34px_rgba(32,28,23,.55)]">
            <div className="relative aspect-[.82] w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--cream)]"><Image src={currentImage(item) ?? item.image} alt={item.name} fill sizes="80px" className="object-cover" /></div>
            <div className="min-w-0"><p className="truncate text-xl leading-tight">{item.name}</p><p className="sans mt-1 text-[13px] text-[var(--muted)]">Tamanho {item.size} · pedido {order.id}</p><p className="display mt-1 text-lg">{formatPrice(item.price)}</p></div>
          </div>))}</div>
          {suggestions.length > 0 && <div className="mt-16">
            <h2 className="display mb-10 text-4xl md:text-5xl">Combinam com <i>o que você escolheu.</i></h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-10">{suggestions.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </div>}
        </div>}

        <div className="grid gap-4 md:grid-cols-2">
          {orders.length === 0 && <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-white/60 p-8 sm:flex-row sm:items-center md:p-10">
            <ShirtFan size={72} />
            <div><h2 className="display text-3xl md:text-4xl">Suas <i>peças.</i></h2><p className="mt-2 text-[var(--ink)]/70">Depois do primeiro pedido, elas aparecem aqui com o tamanho que você levou.</p><PillLink href="/shop" className="mt-5">Ver a coleção</PillLink></div>
          </div>}
          <Link href="/provador" className={`group flex flex-col justify-between gap-6 rounded-[2rem] bg-[var(--terra-dark)] p-8 text-[var(--creme)] md:p-10 ${orders.length ? "md:col-span-2 md:flex-row md:items-center" : ""}`}>
            <div><h2 className="display text-3xl md:text-4xl">Experimente no Provador virtual.</h2><p className="mt-2 max-w-md text-[var(--creme)]/70">Envie uma foto sua, escolha a estampa e veja você vestindo a peça.</p></div>
            <span className="sans inline-flex w-fit items-center gap-2 rounded-full bg-[var(--creme)] px-6 py-3.5 text-[11px] uppercase tracking-[.15em] text-[var(--terra-dark)] transition-colors group-hover:bg-[var(--sol-2)]">Abrir provador</span>
          </Link>
        </div>
      </div>
    </section>
  </main>;
}
