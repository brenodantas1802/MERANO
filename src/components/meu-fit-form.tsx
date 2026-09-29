"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBodyProfile, type ProfileField } from "@/lib/body-profile";
import { useSizeRecommendation } from "@/lib/use-size-recommendation";

const FIELDS: { field: ProfileField; label: string }[] = [
  { field: "altura", label: "Altura (cm)" },
  { field: "peso", label: "Peso (kg)" },
  { field: "busto", label: "Busto / tórax (cm)" },
  { field: "cintura", label: "Cintura (cm)" },
  { field: "quadril", label: "Quadril (cm)" },
];

// Quick version of the "Sobre mim" profile: same measurements, same storage.
export function MeuFitForm() {
  const { profile, update, reset, hasAny } = useBodyProfile();
  const { recommendation } = useSizeRecommendation();

  return (
    <div>
      <form onSubmit={(event) => event.preventDefault()} className="grid gap-6 md:grid-cols-2">
        {FIELDS.map(({ field, label }) => <div key={field} className="flex flex-col space-y-2"><Label htmlFor={field}>{label}</Label><Input id={field} inputMode="decimal" value={profile[field]} onChange={(event) => update(field, event.target.value.replace(/[^\d.,]/g, "").slice(0, 5))} /></div>)}
      </form>
      <p className="sans mt-4 text-[11px] text-[var(--muted)]">Salvas neste navegador. Quer refinar com ombro, tronco e braço? <Link href="/sobre-mim" className="underline underline-offset-4 hover:text-[var(--ink)]">Complete seu perfil em Sobre mim</Link>.</p>

      {recommendation && (
        <div className="mt-10 flex items-center gap-6 border-y border-[var(--ink)] py-7">
          <span className="display flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--sol-1)] text-5xl text-white">{recommendation.size}</span>
          <div>
            <p className="script -rotate-1 text-2xl text-[var(--terra)]">o seu tamanho é</p>
            <p className="mt-1 text-lg leading-snug">{recommendation.reason} Vamos deixar o <strong>{recommendation.size}</strong> marcado em todas as peças da loja.</p>
            <Link href="/shop" className="sans mt-4 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-1 text-[11px] uppercase tracking-[.15em]">Ver a coleção <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      )}

      {hasAny && <button onClick={reset} className="sans mt-6 block text-[10px] uppercase tracking-[.12em] text-[var(--muted)] underline underline-offset-4">Apagar minhas medidas salvas</button>}
    </div>
  );
}
