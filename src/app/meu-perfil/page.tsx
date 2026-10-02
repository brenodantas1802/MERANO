"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { FitFigure } from "@/components/fit-figure";
import { ProductCard } from "@/components/product-card";
import { PillLink } from "@/components/ui/pill-link";
import { ShirtFan } from "@/components/try-on-visuals";
import { measure, RANGES, useBodyProfile, type ProfileField } from "@/lib/body-profile";
import { recommendSize } from "@/lib/size-recommendation";
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
  return <div className="relative h-44 w-44 shrink-0 md:h-52 md:w-52">
    <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
      <defs><linearGradient id="ring-sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f37c22" /><stop offset="1" stopColor="#fabd4b" /></linearGradient></defs>
      <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--ink)" strokeOpacity={0.08} strokeWidth={7} />
      <motion.circle cx="64" cy="64" r={radius} fill="none" stroke="url(#ring-sun)" strokeWidth={7} strokeLinecap="round" strokeDasharray={length} initial={{ strokeDashoffset: length }} animate={{ strokeDashoffset: length * (1 - share) }} transition={{ duration: 1.1, ease: EASE }} />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="display text-5xl md:text-6xl">{Math.round(share * 100)}%</span>
      <span className="sans mt-1 text-[13px] text-[var(--muted)]">{filled} de {total} medidas</span>
    </div>
  </div>;
}

export default function MeuPerfilPage() {
  const { profile, update, reset, hasAny } = useBodyProfile();
  const orders = useOrders();
  const [showSpecifics, setShowSpecifics] = useState(false);
  const recommendation = recommendSize(profile, SIZE_CHART);
  const [previewSize, setPreviewSize] = useState<string | null>(null);
  const shownSize = SIZE_CHART.find((row) => row.size === (previewSize ?? recommendation?.size ?? "M")) ?? SIZE_CHART[2];
  const filled = ALL.filter(({ field }) => measure(profile, field)).length;

  const boughtIds = [...new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))];
  const suggestions = similarProducts(boughtIds, 3);

  return <main className="season-wash">
    <SiteHeader />

    <section className="mx-auto flex max-w-360 flex-col gap-10 px-6 pb-10 pt-10 md:flex-row md:items-center md:justify-between md:px-12 md:pb-14 md:pt-16">
      <div>
        <p className="script text-4xl text-[var(--sol-1)]">o seu caimento</p>
        <h1 className="display mt-1 text-7xl md:text-9xl">Meu <i>perfil.</i></h1>
        <p className="mt-6 max-w-lg text-xl leading-snug text-[var(--ink)]/80">Guarde suas medidas uma vez. A Merano marca o tamanho certo em cada peça e mostra como ela cai em você.</p>
      </div>
      <ProgressRing filled={filled} total={ALL.length} />
    </section>

    <section className="mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)] gap-10 px-6 pb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,.95fr)] md:gap-14 md:px-12 md:pb-28">
      <div>
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-4xl md:text-5xl">Suas medidas.</h2>
          <Link href="/meu-fit" className="sans pb-1 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Como medir</Link>
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

        <p className="sans mt-6 text-[13px] leading-relaxed text-[var(--muted)]">Ficam salvas neste navegador e valem também para o Merano Fit. {hasAny && <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-[var(--ink)]">Apagar meu perfil</button>}</p>
      </div>

      <aside className="md:sticky md:top-[calc(var(--header-h,72px)+1.5rem)] md:h-fit">
        <div className="overflow-hidden rounded-[2.5rem] bg-[radial-gradient(90%_60%_at_40%_35%,#1d5a63_0%,#0f3d44_55%,#0a2a2f_100%)] text-[var(--paper)] shadow-[0_40px_80px_-50px_rgba(10,42,47,.9)]">
          <div className="flex items-center justify-between px-7 pt-7">
            <p className="script text-3xl text-[var(--sol-2)]">como a Merano cai em você</p>
          </div>
          <FitFigure profile={profile} size={shownSize} className="mx-auto -mt-2 h-auto w-full max-w-[440px]" />
          <div className="flex flex-wrap items-center justify-center gap-2 px-6 pb-2" role="group" aria-label="Ver a camiseta em outro tamanho">
            {SIZE_CHART.map((row) => {
              const active = row.size === shownSize.size;
              return <button key={row.size} type="button" onClick={() => setPreviewSize(row.size)} aria-pressed={active} className={`sans relative h-11 w-11 rounded-full text-sm transition-colors duration-300 ${active ? "bg-[var(--paper)] text-[var(--ink)]" : "border border-white/25 text-white/85 hover:border-white/70"}`}>
                {row.size}
                {recommendation?.size === row.size && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--sol-1)] ring-2 ring-[#0f3d44]" aria-label="tamanho recomendado" />}
              </button>;
            })}
          </div>
          <p className="sans pb-6 text-center text-[13px] text-white/60">Toque num tamanho pra ver o caimento{recommendation ? " · o ponto laranja é o seu" : ""}.</p>

          <div className="m-3 mt-0 flex items-center gap-5 rounded-[2rem] bg-white/[.07] p-5 ring-1 ring-white/10 md:p-6">
            {recommendation ? <>
              <span className="display flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--sol-1)] to-[var(--sol-2)] text-4xl text-[var(--terra-dark)]">{recommendation.size}</span>
              <div><p className="display text-2xl">Você veste {recommendation.size}.</p><p className="mt-1 text-[15px] leading-snug text-white/75">{recommendation.reason} A gente já deixa marcado em cada peça.</p></div>
            </> : <div><p className="display text-2xl">Falta pouco.</p><p className="mt-1 text-[15px] leading-snug text-white/75">Preencha o busto (ou a cintura, o quadril ou os ombros) pra descobrir o seu tamanho.</p></div>}
          </div>
        </div>
      </aside>
    </section>

    <section id="pecas" className="scroll-mt-24 bg-[var(--paper)]">
      <div className="mx-auto max-w-360 px-6 py-16 md:px-12 md:py-24">
        {orders.length ? <>
          <h2 className="display text-4xl md:text-6xl">Suas <i>peças.</i></h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{orders.slice(0, 3).flatMap((order) => order.items.map((item) => <div key={`${order.id}-${item.productId}-${item.size}`} className="flex items-center gap-4 rounded-[1.75rem] bg-white/70 p-3 pr-5 shadow-[0_18px_40px_-34px_rgba(32,28,23,.55)]">
            <div className="relative aspect-[.82] w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--cream)]"><Image src={currentImage(item) ?? item.image} alt={item.name} fill sizes="80px" className="object-cover" /></div>
            <div className="min-w-0"><p className="truncate text-xl leading-tight">{item.name}</p><p className="sans mt-1 text-[13px] text-[var(--muted)]">Tamanho {item.size} · pedido {order.id}</p><p className="display mt-1 text-lg">{formatPrice(item.price)}</p></div>
          </div>))}</div>
          {suggestions.length > 0 && <div className="mt-20">
            <h2 className="display mb-10 text-4xl md:text-5xl">Combinam com <i>o que você escolheu.</i></h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-10">{suggestions.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </div>}
        </> : <div className="flex flex-col items-center gap-8 rounded-[2rem] bg-white/50 px-6 py-14 text-center md:flex-row md:justify-between md:px-14 md:text-left">
          <ShirtFan size={96} />
          <div className="max-w-lg md:mr-auto md:ml-10"><h2 className="display text-4xl md:text-5xl">Suas <i>peças.</i></h2><p className="mt-3 text-lg text-[var(--ink)]/70">Assim que você fizer o primeiro pedido, ele aparece aqui — junto com peças que combinam com a sua escolha.</p></div>
          <PillLink href="/shop" variant="solid">Ver a coleção</PillLink>
        </div>}
      </div>
    </section>
  </main>;
}
