"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { abrirCadeado, entrarComTelefone, type Resultado } from "./acoes";

// After access is granted: a full page load of "/" (not a client navigation), so the padlock animation runs.
function useEntrar(resultado: Resultado) {
  const ok = Boolean(resultado?.ok);
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load is the point: it runs SCRIPT_ENTRADA
  useEffect(() => { if (ok) window.location.assign("/"); }, [ok]);
}

// Shown once the browser has access (Next re-renders this page right after the action sets the cookie): a full load
// of "/" from here is what plays the padlock animation.
export function Entrando() {
  useEntrar({ ok: true });
  return <p className="display text-3xl">Abrindo o cadeado…</p>;
}

const botao = "btn-ouro press label flex h-[52px] w-full items-center justify-center rounded-full text-[13px] text-[var(--vinho)] disabled:opacity-70";
const aviso = "sans mt-3 rounded-xl bg-[var(--vinho)]/10 px-4 py-3 text-[13px] text-[var(--vinho)]";

export function AbrirCadeado() {
  const [resultado, abrir, abrindo] = useActionState(abrirCadeado, null);
  useEntrar(resultado);
  return <form action={abrir} className="mt-6">
    <button type="submit" disabled={abrindo || resultado?.ok} className={botao}>{abrindo || resultado?.ok ? "Abrindo…" : "Abrir o cadeado"}</button>
    {resultado && "erro" in resultado && <p role="alert" className={aviso}>{resultado.erro}</p>}
  </form>;
}

const mascara = (valor: string) => valor.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");

// While the team hasn't answered the access request: the page checks again every 20 seconds, so it turns into
// "Você está na lista" by itself once an owner taps "Liberar" in /admin.
export function Aguardando() {
  const router = useRouter();
  useEffect(() => {
    const intervalo = window.setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, 20000);
    return () => window.clearInterval(intervalo);
  }, [router]);
  return <p className="sans mt-5 flex items-center gap-3 text-[13px] text-[var(--muted)]"><span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[var(--latao)]" />Esperando a equipe liberar. Pode deixar esta página aberta.</p>;
}

export function FormTelefone({ rotulo = "Liberar meu acesso", inicial = "" }: { rotulo?: string; inicial?: string }) {
  const [resultado, enviar, enviando] = useActionState(entrarComTelefone, null);
  const [telefone, setTelefone] = useState(() => mascara(inicial.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "")));
  useEntrar(resultado);
  return <form action={enviar} className="mt-5">
    <label className="sans block text-[12px] text-[var(--muted)]">Seu WhatsApp, com DDD (obrigatório)
      <input name="telefone" required minLength={14} inputMode="tel" autoComplete="tel-national" value={telefone} onChange={(event) => setTelefone(mascara(event.target.value))} placeholder="(11) 90000-0000" className="mt-2 block h-12 w-full rounded-[14px] border border-[var(--line)] bg-white/70 px-4 text-base text-[var(--ink)] outline-none focus:border-[var(--vinho)]/60" />
    </label>
    <button type="submit" disabled={enviando || resultado?.ok} className={`${botao} mt-4`}>{enviando || resultado?.ok ? "Conferindo…" : rotulo}</button>
    {resultado && "erro" in resultado && <p role="alert" className={aviso}>{resultado.erro}</p>}
  </form>;
}
