"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BodyAvatar } from "@/components/body-avatar";
import { Doodle } from "@/components/doodle";
import { ProductCard } from "@/components/product-card";
import { measure, RANGES, useBodyProfile, type ProfileField } from "@/lib/body-profile";
import { recommendSize } from "@/lib/size-recommendation";
import { useOrders } from "@/lib/orders";
import { formatPrice, SIZE_CHART, similarProducts } from "@/lib/products";
import { SeaWaves } from "@/components/beach-art";

type FieldSpec = { field: ProfileField; label: string; unit: string; hint: string };

const ESSENTIALS: FieldSpec[] = [
  { field: "altura", label: "Altura", unit: "cm", hint: "Descalça, encostada na parede." },
  { field: "peso", label: "Peso", unit: "kg", hint: "Só pra calibrar o caimento." },
  { field: "busto", label: "Busto / tórax", unit: "cm", hint: "Na parte mais larga do peito, fita paralela ao chão." },
  { field: "cintura", label: "Cintura", unit: "cm", hint: "Na linha do umbigo, sem encolher a barriga." },
  { field: "quadril", label: "Quadril", unit: "cm", hint: "Na parte mais larga, com os pés juntos." },
];

const SPECIFICS: FieldSpec[] = [
  { field: "ombro", label: "Ombro a ombro", unit: "cm", hint: "Pelas costas, de uma ponta do ombro à outra. Decide o caimento do oversized." },
  { field: "tronco", label: "Comprimento do tronco", unit: "cm", hint: "Da base do pescoço até a cintura, pelas costas." },
  { field: "braco", label: "Comprimento do braço", unit: "cm", hint: "Do ombro ao pulso, com o braço relaxado." },
  { field: "entrepernas", label: "Entrepernas", unit: "cm", hint: "Da virilha até o tornozelo, pela parte de dentro." },
];

function MeasureInput({ spec, value, onChange }: { spec: FieldSpec; value: string; onChange: (value: string) => void }) {
  const [min, max] = RANGES[spec.field];
  const number = Number(value.replace(",", "."));
  const outOfRange = value !== "" && (!Number.isFinite(number) || number < min || number > max);
  return <label className="group block border-b border-[var(--ink)]/20 pb-4 pt-5 transition-colors focus-within:border-[var(--ink)]">
    <span className="flex items-baseline justify-between gap-4"><span className="text-lg">{spec.label}</span><span className="sans text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">{spec.unit}</span></span>
    <input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, "").slice(0, 5))} placeholder="—" className="display mt-1 block w-full bg-transparent text-5xl outline-none placeholder:text-[var(--ink)]/20 md:text-6xl" />
    <span className={`sans mt-1 block text-[11px] ${outOfRange ? "text-[#8a3a2c]" : "text-[var(--muted)]"}`}>{outOfRange ? `Confere esse valor? Esperávamos algo entre ${min} e ${max} ${spec.unit}.` : spec.hint}</span>
  </label>;
}

export default function SobreMimPage() {
  const { profile, update, reset, hasAny } = useBodyProfile();
  const orders = useOrders();
  const [showSpecifics, setShowSpecifics] = useState(false);
  const recommendation = recommendSize(profile, SIZE_CHART);
  const filled = [...ESSENTIALS, ...SPECIFICS].filter(({ field }) => measure(profile, field)).length;

  const boughtIds = [...new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))];
  const suggestions = similarProducts(boughtIds, 3);
  const extras = ([["peso", "Peso", "kg"], ["tronco", "Tronco", "cm"], ["braco", "Braço", "cm"]] as const).filter(([field]) => measure(profile, field));

  return <main>
    <SiteHeader />

    <section className="grain relative overflow-hidden">
      <div className="mx-auto max-w-360 px-6 pb-16 pt-14 md:px-12 md:pb-24 md:pt-20">
        <p className="sans text-[10px] uppercase tracking-[.2em] text-[var(--terra)]">Seu perfil Merano</p>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="display text-7xl md:text-9xl">Sobre <i>mim.</i></h1>
            <p className="mt-6 max-w-lg text-xl leading-snug">Seu perfil de caimento. Guarde suas medidas uma vez e a Merano recomenda o tamanho certo em cada peça — e sugere o que combina com você.</p>
          </div>
          <div className="relative w-fit -rotate-2 rounded-[2rem] bg-[var(--paper)] px-7 py-5 shadow-[0_18px_40px_-24px_rgba(32,28,23,.45)]">
            <p className="script text-2xl text-[var(--terra)]">seu perfil está</p>
            <p className="display text-5xl">{Math.round((filled / (ESSENTIALS.length + SPECIFICS.length)) * 100)}%</p>
            <p className="sans text-[10px] uppercase tracking-[.14em] text-[var(--muted)]">{filled} de {ESSENTIALS.length + SPECIFICS.length} medidas</p>
            <Doodle name="sun" className="absolute -right-6 -top-6 h-12 w-12 text-[var(--sol-1)]" />
          </div>
        </div>
      </div>
      <SeaWaves />
    </section>

    <section className="mx-auto grid max-w-360 gap-14 px-6 py-16 md:grid-cols-[1fr_minmax(0,1.05fr)] md:gap-20 md:px-12 md:py-24">
      <div>
        <div className="flex items-end justify-between gap-4"><h2 className="display text-4xl md:text-5xl">O essencial.</h2><Link href="/meu-fit" className="sans pb-1 text-[10px] uppercase tracking-[.14em] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">Como medir</Link></div>
        <p className="mt-3 text-[var(--muted)]">É com essas cinco que a gente escolhe o seu tamanho.</p>
        <div className="mt-4">{ESSENTIALS.map((spec) => <MeasureInput key={spec.field} spec={spec} value={profile[spec.field]} onChange={(value) => update(spec.field, value)} />)}</div>

        <button type="button" onClick={() => setShowSpecifics((open) => !open)} aria-expanded={showSpecifics} className="group mt-12 flex w-full items-center justify-between rounded-full border border-[var(--ink)] px-6 py-4 text-left transition-colors hover:bg-[var(--ink)] hover:text-[var(--creme)]">
          <span><span className="text-lg">Adicionar medidas específicas</span><span className="sans ml-3 text-[10px] uppercase tracking-[.14em] opacity-60">opcional</span></span>
          <motion.span animate={{ rotate: showSpecifics ? 45 : 0 }}><Plus size={18} strokeWidth={1.5} /></motion.span>
        </button>
        <AnimatePresence initial={false}>
          {showSpecifics && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <p className="script mt-6 -rotate-1 text-2xl text-[var(--terra)]">pra quem gosta de tudo no ponto.</p>
            {SPECIFICS.map((spec) => <MeasureInput key={spec.field} spec={spec} value={profile[spec.field]} onChange={(value) => update(spec.field, value)} />)}
          </motion.div>}
        </AnimatePresence>

        <p className="sans mt-8 text-[11px] leading-relaxed text-[var(--muted)]">Suas medidas ficam salvas neste navegador e valem também para o Meu Merano Fit. {hasAny && <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-[var(--ink)]">Apagar meu perfil</button>}</p>
      </div>

      <aside className="md:sticky md:top-28 md:h-fit">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--areia)]/30 px-4 pb-8 pt-6 md:px-8">
          <p className="script text-center text-2xl text-[var(--terra)]">você, em linhas</p>
          <BodyAvatar profile={profile} className="mx-auto mt-2 h-auto w-full max-w-[420px]" />
          {extras.length > 0 && <div className="mt-2 flex flex-wrap justify-center gap-2">{extras.map(([field, label, unit]) => <span key={field} className="sans rounded-full bg-[var(--paper)] px-3 py-1.5 text-[11px]">{label} <strong className="font-medium">{profile[field]} {unit}</strong></span>)}</div>}
        </div>

        <div className="mt-6 flex items-center gap-6 rounded-[2rem] bg-[var(--terra-dark)] p-6 text-[var(--creme)] md:p-8">
          {recommendation ? <>
            <span className="display flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--sol-1)] to-[var(--sol-2)] text-4xl text-[var(--terra-dark)]">{recommendation.size}</span>
            <div><p className="script text-2xl text-[var(--sol-2)]">nas camisetas Merano, você veste</p><p className="mt-1 text-lg leading-snug text-[var(--creme)]/85">{recommendation.reason} A gente já deixa marcado em cada peça.</p></div>
          </> : <div><p className="script text-2xl text-[var(--sol-2)]">quase lá</p><p className="mt-1 text-lg leading-snug text-[var(--creme)]/85">Preencha pelo menos o busto (ou a cintura, o quadril ou os ombros) para ver o seu tamanho.</p></div>}
        </div>
      </aside>
    </section>

    <section id="pecas" className="scroll-mt-20 border-t border-[var(--ink)]/15 bg-[var(--paper)]">
      <div className="mx-auto max-w-360 px-6 py-16 md:px-12 md:py-24">
        {orders.length ? <>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div><h2 className="display text-4xl md:text-5xl">Suas peças.</h2><p className="mt-3 text-[var(--muted)]">O que você já escolheu na Merano.</p></div>
            <div className="flex flex-wrap gap-4">{orders.slice(0, 3).flatMap((order) => order.items.map((item) => <div key={`${order.id}-${item.productId}-${item.size}`} className="flex w-60 items-center gap-4 rounded-2xl bg-[var(--creme)] p-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]"><Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" /></div>
              <div className="min-w-0"><p className="truncate leading-tight">{item.name}</p><p className="sans mt-1 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Tam. {item.size} · {order.id}</p><p className="sans text-xs">{formatPrice(item.price)}</p></div>
            </div>))}</div>
          </div>
          {suggestions.length > 0 && <div className="mt-20">
            <div className="mb-10 flex items-end gap-4"><h2 className="display text-4xl md:text-5xl">Parecidas com o que você comprou.</h2></div>
            <div className="grid gap-8 md:grid-cols-3 md:gap-x-10">{suggestions.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          </div>}
        </> : <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div><h2 className="display text-4xl md:text-5xl">Suas peças.</h2><p className="mt-3 max-w-lg text-[var(--muted)]">Assim que você fizer o primeiro pedido, ele aparece aqui — junto com sugestões de peças parecidas com o que você escolheu.</p></div>
          <Link href="/shop" className="sans inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3.5 text-[11px] uppercase tracking-[.15em] text-[var(--creme)]">Ver a coleção <ArrowUpRight size={14} /></Link>
        </div>}
      </div>
    </section>
  </main>;
}
