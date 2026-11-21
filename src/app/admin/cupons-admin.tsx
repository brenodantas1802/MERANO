"use client";

import { useActionState, useState, useTransition } from "react";
import { criarCupom, cupomDoPopup, ligarCupom, type Resposta } from "./pedidos-acoes";

// Discount coupons: create, switch on/off, and pick the one the welcome popup reveals. "Usos" counts paid orders.
export type CupomAdmin = { codigo: string; percentual: number; descricao: string | null; ativo: boolean; primeira_compra: boolean; boas_vindas: boolean; criado_em: string; usos: number };

const campo = "mt-2 block h-12 w-full rounded-[14px] border border-[var(--line)] bg-white/70 px-4 text-base outline-none focus:border-[var(--vinho)]/60";

function Cupom({ cupom }: { cupom: CupomAdmin }) {
  const [salvando, startTransition] = useTransition();
  const [resposta, setResposta] = useState<Resposta>(null);
  const agir = (acao: () => Promise<Resposta>) => startTransition(async () => setResposta(await acao()));
  return <li className={`flex flex-wrap items-center gap-x-6 gap-y-3 py-4 ${salvando ? "opacity-60" : ""} ${cupom.ativo ? "" : "text-[var(--muted)]"}`}>
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-3"><b className="text-lg tracking-[.06em]">{cupom.codigo}</b><span className="sans text-sm">{cupom.percentual}% off</span>
        {cupom.boas_vindas && <span className="sans rounded-full bg-[var(--vinho)] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-[var(--creme)]">No pop-up</span>}
        {cupom.primeira_compra && <span className="sans rounded-full bg-[var(--areia)] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-[var(--ink)]">Só 1ª compra</span>}</p>
      <p className="sans mt-1 text-xs text-[var(--muted)]">{cupom.descricao ? `${cupom.descricao} · ` : ""}{cupom.usos} {cupom.usos === 1 ? "uso pago" : "usos pagos"}</p>
      {resposta && <p role="status" className={`sans mt-1 text-xs ${resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--muted)]"}`}>{resposta.texto}</p>}
    </div>
    <div className="sans flex flex-wrap gap-2 text-[11px] uppercase tracking-[.12em]">
      {!cupom.boas_vindas && cupom.ativo && <button type="button" disabled={salvando} onClick={() => agir(() => cupomDoPopup(cupom.codigo))} className="press h-10 rounded-full border border-[var(--line)] px-4 hover:bg-[var(--creme)]">Usar no pop-up</button>}
      <button type="button" disabled={salvando} onClick={() => agir(() => ligarCupom(cupom.codigo, !cupom.ativo))} className={`press h-10 rounded-full px-4 ${cupom.ativo ? "border border-[var(--line)] hover:bg-[var(--creme)]" : "bg-[var(--vinho)] text-[var(--creme)]"}`}>{cupom.ativo ? "Desligar" : "Ligar"}</button>
    </div>
  </li>;
}

export function CuponsAdmin({ cupons }: { cupons: CupomAdmin[] | null }) {
  const [resposta, criar, criando] = useActionState(criarCupom, null);
  if (cupons === null) return <section className="mt-24"><h2 className="display text-6xl">Cupons.</h2><p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver os cupons aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> na Vercel.</p></section>;
  const doPopup = cupons.find((cupom) => cupom.boas_vindas && cupom.ativo);
  return <section className="mt-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Descontos</p>
    <h2 className="display text-6xl">Cupons.</h2>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">O cliente digita o código no pagamento. {doPopup ? `O pop-up de primeira compra mostra o ${doPopup.codigo}.` : "Nenhum cupom está no pop-up: ele só guarda o e-mail, sem mostrar código."} Desligar um cupom faz ele parar de valer na hora; os pedidos que já usaram continuam como estão.</p>

    {cupons.length > 0 && <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">{cupons.map((cupom) => <Cupom key={cupom.codigo} cupom={cupom} />)}</ul>}

    <form action={criar} className="mt-10 grid gap-4 md:grid-cols-[1fr_140px_2fr]">
      <label className="sans block text-[12px] text-[var(--muted)]">Código<input name="codigo" required minLength={3} maxLength={30} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="EX: AMIGO15" className={`${campo} uppercase tracking-[.06em]`} /></label>
      <label className="sans block text-[12px] text-[var(--muted)]">Desconto (%)<input name="percentual" required type="number" min={1} max={90} step={1} inputMode="numeric" placeholder="10" className={campo} /></label>
      <label className="sans block text-[12px] text-[var(--muted)]">Para que é (só vocês veem)<input name="descricao" maxLength={200} placeholder="Ex: homenagem ao…" className={campo} /></label>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-3">
        <label className="sans flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="primeira_compra" className="h-5 w-5 accent-[var(--vinho)]" /> Só vale na primeira compra de cada e-mail</label>
        <button type="submit" disabled={criando} className="sans press h-12 rounded-full bg-[var(--vinho)] px-7 text-[12px] uppercase tracking-[.14em] text-[var(--creme)] disabled:opacity-60">{criando ? "Criando…" : "Criar cupom"}</button>
        {resposta && <p role="status" className={`sans text-sm ${resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--muted)]"}`}>{resposta.texto}</p>}
      </div>
    </form>
  </section>;
}
