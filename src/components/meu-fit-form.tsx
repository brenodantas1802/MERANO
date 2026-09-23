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

function recommendSize(bustoCm: number) {
  const match = SIZE_CHART.find((row) => row.largura * 2 >= bustoCm);
  return match ?? SIZE_CHART[SIZE_CHART.length - 1];
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
        <div className="mt-10 border-t border-[var(--line)] pt-8">
          <p className="sans mb-3 text-[10px] uppercase tracking-[.2em] text-[var(--muted)]">Com base nas suas medidas</p>
          <p className="text-2xl">Seu tamanho recomendado é <strong>{recommendation.size}</strong>.</p>
          <Link href="/a-marca#sob-demanda" className="sans mt-6 inline-flex items-center gap-2 border-2 border-[var(--ink)] px-5 py-2.5 text-[11px] uppercase tracking-[.15em]">Fazer sob medida <ArrowUpRight size={14} /></Link>
        </div>
      )}

      {saved && <button onClick={reset} className="sans mt-6 block text-[10px] uppercase tracking-[.12em] text-[var(--muted)] underline underline-offset-4">Apagar minhas medidas salvas</button>}
    </div>
  );
}
