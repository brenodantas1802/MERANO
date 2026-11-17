"use client";

import { useActionState, useEffect, useState } from "react";
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
    {resultado && !resultado.ok && <p role="alert" className={aviso}>{resultado.erro}</p>}
  </form>;
}

const mascara = (valor: string) => valor.replace(/\D/g, "").slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");

export function FormTelefone() {
  const [resultado, enviar, enviando] = useActionState(entrarComTelefone, null);
  const [telefone, setTelefone] = useState("");
  useEntrar(resultado);
  return <form action={enviar} className="mt-5">
    <label className="sans block text-[12px] text-[var(--muted)]">WhatsApp que está no grupo
      <input name="telefone" required inputMode="tel" autoComplete="tel" value={telefone} onChange={(event) => setTelefone(mascara(event.target.value))} placeholder="(11) 90000-0000" className="mt-2 block h-12 w-full rounded-[14px] border border-[var(--line)] bg-white/70 px-4 text-base text-[var(--ink)] outline-none focus:border-[var(--vinho)]/60" />
    </label>
    <button type="submit" disabled={enviando || resultado?.ok} className={`${botao} mt-4`}>{enviando || resultado?.ok ? "Conferindo…" : "Liberar meu acesso"}</button>
    {resultado && !resultado.ok && <p role="alert" className={aviso}>{resultado.erro}</p>}
  </form>;
}
