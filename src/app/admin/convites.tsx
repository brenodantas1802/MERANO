"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";
import { alternarConvite, criarConvite } from "./convites-acoes";

export type ConviteAdmin = { id: string; codigo: string; nome: string; limite: number | null; usos: number; ativo: boolean; criado_em: string };

const campo = "mt-2 block h-11 w-full border-b border-[var(--ink)]/30 bg-transparent text-base outline-none focus:border-[var(--vinho)]";

function LinhaConvite({ convite, origem }: { convite: ConviteAdmin; origem: string }) {
  const [copiado, setCopiado] = useState(false);
  const [mudando, startTransition] = useTransition();
  const link = `${origem}/convite/${convite.codigo}`;
  const esgotado = convite.limite !== null && convite.usos >= convite.limite;
  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // The link stays visible and selectable.
    }
  }
  return <li className={`grid gap-3 py-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto] md:items-center ${convite.ativo ? "" : "opacity-55"}`}>
    <div className="min-w-0">
      <p className="text-lg leading-tight">{convite.nome}</p>
      <p className="sans mt-1 text-xs text-[var(--muted)]">{convite.usos} {convite.usos === 1 ? "entrada" : "entradas"}{convite.limite !== null ? ` de ${convite.limite}` : ""} · criado em {new Date(convite.criado_em).toLocaleDateString("pt-BR")}{!convite.ativo ? " · desativado" : esgotado ? " · esgotado" : ""}</p>
    </div>
    <div className="flex min-w-0 items-center gap-2">
      <code className="sans min-w-0 flex-1 select-all truncate rounded-full bg-[var(--areia)] px-4 py-2.5 text-[13px]">{link}</code>
      <button type="button" onClick={copiar} aria-label={`Copiar o link de ${convite.nome}`} className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--ink)]/20 hover:bg-[var(--creme)]">{copiado ? <Check size={15} /> : <Copy size={15} />}</button>
    </div>
    <button type="button" disabled={mudando} onClick={() => startTransition(() => alternarConvite(convite.id, !convite.ativo))} className="sans press h-11 justify-self-start rounded-full border border-[var(--ink)]/20 px-5 text-[12px] uppercase tracking-[.12em] hover:bg-[var(--creme)] disabled:opacity-50">{convite.ativo ? "Desativar" : "Reativar"}</button>
  </li>;
}

// Pre-sale access: each invite is its own link for the WhatsApp group (or for one person), with an entry count.
export function Convites({ convites, origem, cadeadoLigado }: { convites: ConviteAdmin[] | null; origem: string; cadeadoLigado: boolean }) {
  const [erro, criar, criando] = useActionState(criarConvite, null);
  return <section className="mb-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Pré-venda</p>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="display text-6xl">Convites.</h2>
      <span className={`sans rounded-full px-4 py-2 text-[11px] uppercase tracking-[.14em] ${cadeadoLigado ? "bg-[var(--vinho)] text-[var(--creme)]" : "bg-[var(--areia)] text-[var(--ink)]"}`}>Cadeado {cadeadoLigado ? "ligado" : "desligado"}</span>
    </div>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">Cada convite é um link. Quem abre entra no site por 90 dias naquele aparelho. {cadeadoLigado ? "O site está trancado para quem não tem convite." : "O site está aberto para todo mundo agora; os links só passam a valer quando o cadeado for ligado na Vercel (PRE_VENDA=1)."} Desativar um convite impede novas entradas por ele.</p>

    {convites === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para criar convites aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> (chave secreta do Supabase) na Vercel.</p> : <>
      <form action={criar} className="mt-8 grid gap-5 border-y border-[var(--line)] py-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,.6fr)_auto] md:items-end">
        <label className="sans text-[12px] text-[var(--muted)]">Para quem<input name="nome" required maxLength={80} placeholder="Grupo do WhatsApp" className={campo} /></label>
        <label className="sans text-[12px] text-[var(--muted)]">Limite de entradas (opcional)<input name="limite" type="number" min={1} inputMode="numeric" placeholder="Sem limite" className={campo} /></label>
        <button type="submit" disabled={criando} className="sans press h-12 rounded-full bg-[var(--vinho)] px-7 text-[12px] uppercase tracking-[.14em] text-[var(--creme)] disabled:opacity-60">{criando ? "Criando…" : "Criar convite"}</button>
        {erro && <p role="alert" className="sans text-sm text-[var(--vinho)] md:col-span-3">{erro}</p>}
      </form>
      {convites.length === 0 ? <p className="sans mt-6 text-sm text-[var(--muted)]">Nenhum convite ainda.</p>
        : <ul className="divide-y divide-[var(--line)] border-b border-[var(--line)]">{convites.map((convite) => <LinhaConvite key={convite.id} convite={convite} origem={origem} />)}</ul>}
    </>}
  </section>;
}
