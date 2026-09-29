"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SIZE_CHART } from "@/lib/products";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Measurements = { altura: string; peso: string; idade: string; busto: string };

const STORAGE_KEY = "merano-fit-measurements";
const EMPTY: Measurements = { altura: "", peso: "", idade: "", busto: "" };
const listeners = new Set<() => void>();
let cached: Measurements | undefined;
let initialized = false;

function readStorage(): Measurements {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(values: Measurements) {
  cached = values;
  initialized = true;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!initialized) {
    cached = readStorage();
    initialized = true;
  }
  return cached!;
}

function getServerSnapshot() {
  return EMPTY;
}

// The chart is the garment's flat width, so the body needs some ease on top of it to fit comfortably.
const EASE_CM = 8;

function recommendSize(bustoCm: number) {
  const match = SIZE_CHART.find((row) => row.largura * 2 >= bustoCm + EASE_CM);
  return match ?? SIZE_CHART[SIZE_CHART.length - 1];
}

export function useRecommendedSize() {
  const values = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const busto = Number(values.busto);
  return busto > 0 ? recommendSize(busto).size : null;
}

export function MeuFitForm() {
  const values = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = Object.values(values).some(Boolean);

  function update(field: keyof Measurements, value: string) {
    write({ ...values, [field]: value });
  }

  function reset() {
    write(EMPTY);
  }

  const busto = Number(values.busto);
  const recommendation = busto > 0 ? recommendSize(busto) : null;

  return (
    <div>
      <form onSubmit={(event) => event.preventDefault()} className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col space-y-2"><Label htmlFor="altura">Altura (cm)</Label><Input id="altura" required type="number" min={100} max={230} value={values.altura} onChange={(event) => update("altura", event.target.value)} /></div>
        <div className="flex flex-col space-y-2"><Label htmlFor="peso">Peso (kg)</Label><Input id="peso" required type="number" min={30} max={250} value={values.peso} onChange={(event) => update("peso", event.target.value)} /></div>
        <div className="flex flex-col space-y-2"><Label htmlFor="idade">Idade</Label><Input id="idade" required type="number" min={10} max={110} value={values.idade} onChange={(event) => update("idade", event.target.value)} /></div>
        <div className="flex flex-col space-y-2"><Label htmlFor="busto">Circunferência do busto (cm)</Label><Input id="busto" required type="number" min={60} max={180} value={values.busto} onChange={(event) => update("busto", event.target.value)} /></div>
      </form>
      <p className="sans mt-4 text-[10px] uppercase tracking-[.1em] text-[var(--muted)]">Suas medidas são salvas automaticamente neste navegador.</p>

      {recommendation && (
        <div className="mt-10 flex items-center gap-6 border-y border-[var(--ink)] py-7">
          <span className="display flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--sol-1)] text-5xl text-white">{recommendation.size}</span>
          <div>
            <p className="script -rotate-1 text-2xl text-[var(--terra)]">o seu tamanho é</p>
            <p className="mt-1 text-lg leading-snug">Vamos deixar o <strong>{recommendation.size}</strong> marcado em todas as peças da loja.</p>
            <Link href="/shop" className="sans mt-4 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-1 text-[11px] uppercase tracking-[.15em]">Ver a coleção <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      )}

      {saved && <button onClick={reset} className="sans mt-6 block text-[10px] uppercase tracking-[.12em] text-[var(--muted)] underline underline-offset-4">Apagar minhas medidas salvas</button>}
    </div>
  );
}
