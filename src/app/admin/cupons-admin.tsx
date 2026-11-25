"use client";

import { useActionState, useState, useTransition } from "react";
import { criarCupom, cupomDoPopup, editarCupom, excluirCupom, ligarCupom, type Resposta } from "./pedidos-acoes";

// Discount coupons: create, edit, delete, switch on/off, and pick the one the welcome popup reveals. "Usos" counts
// paid orders.
export type CupomAdmin = { codigo: string; percentual: number; descricao: string | null; ativo: boolean; primeira_compra: boolean; boas_vindas: boolean; criado_em: string; usos: number };

const campo = "mt-2 block h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--campo)] px-4 text-base outline-none focus:border-[var(--vinho)]/60";

const botao = "press h-10 rounded-full border border-[var(--line)] px-4 hover:bg-[var(--realce)]";

// Edits the coupon in place. Changing the code makes the old one stop working (orders that used it follow along).
function EditarCupom({ cupom, fechar }: { cupom: CupomAdmin; fechar: (resposta: Resposta) => void }) {
  const [resposta, salvar, salvando] = useActionState(async (anterior: Resposta, form: FormData) => {
    const resultado = await editarCupom(cupom.codigo, anterior, form);
    if (resultado?.tipo === "ok") fechar(resultado);
    return resultado;
  }, null);
  return <form action={salvar} className="grid w-full gap-4 md:grid-cols-[1fr_140px_2fr]">
    <label className="sans block text-[12px] text-[var(--muted)]">Código<input name="codigo" required minLength={3} maxLength={30} defaultValue={cupom.codigo} autoCapitalize="characters" autoComplete="off" spellCheck={false} className={`${campo} uppercase tracking-[.06em]`} /></label>
    <label className="sans block text-[12px] text-[var(--muted)]">Desconto (%)<input name="percentual" required type="number" min={1} max={99} step={1} inputMode="numeric" defaultValue={cupom.percentual} className={campo} /></label>
    <label className="sans block text-[12px] text-[var(--muted)]">Para que é (só vocês veem)<input name="descricao" maxLength={200} defaultValue={cupom.descricao ?? ""} className={campo} /></label>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-3">
      <label className="sans flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="primeira_compra" defaultChecked={cupom.primeira_compra} className="h-5 w-5 accent-[var(--vinho)]" /> Só vale na primeira compra de cada e-mail</label>
      <div className="sans flex gap-2 text-[11px] uppercase tracking-[.12em]">
        <button type="button" disabled={salvando} onClick={() => fechar(null)} className={botao}>Cancelar</button>
        <button type="submit" disabled={salvando} className="press h-10 rounded-full bg-[var(--vinho)] px-5 text-[var(--creme)] disabled:opacity-60">{salvando ? "Salvando…" : "Salvar"}</button>
      </div>
      <p className="sans text-xs text-[var(--muted)]">Trocar o código faz o antigo parar de valer{cupom.boas_vindas ? ": quem já recebeu este cupom pelo pop-up não consegue mais usar" : ""}.</p>
      {resposta?.tipo === "erro" && <p role="alert" className="sans text-sm text-[var(--vinho)]">{resposta.texto}</p>}
    </div>
  </form>;
}

function Cupom({ cupom }: { cupom: CupomAdmin }) {
  const [salvando, startTransition] = useTransition();
  const [resposta, setResposta] = useState<Resposta>(null);
  const [modo, setModo] = useState<"ver" | "editar" | "excluir">("ver");
  const agir = (acao: () => Promise<Resposta>) => startTransition(async () => setResposta(await acao()));
  if (modo === "editar") return <li className="py-5"><EditarCupom cupom={cupom} fechar={(resultado) => { setResposta(resultado); setModo("ver"); }} /></li>;
  return <li className={`flex flex-wrap items-center gap-x-6 gap-y-3 py-4 ${salvando ? "opacity-60" : ""} ${cupom.ativo ? "" : "text-[var(--muted)]"}`}>
    <div className="min-w-[min(100%,16rem)] flex-1">
      <p className="flex flex-wrap items-center gap-3"><b className="text-lg tracking-[.06em]">{cupom.codigo}</b><span className="sans text-sm">{cupom.percentual}% off</span>
        {cupom.boas_vindas && <span className="sans rounded-full bg-[var(--vinho)] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-[var(--creme)]">No pop-up</span>}
        {cupom.primeira_compra && <span className="sans rounded-full bg-[var(--areia)] px-3 py-1 text-[10px] uppercase tracking-[.12em] text-[var(--ink)]">Só 1ª compra</span>}</p>
      <p className="sans mt-1 text-xs text-[var(--muted)]">{cupom.descricao ? `${cupom.descricao} · ` : ""}{cupom.usos} {cupom.usos === 1 ? "uso pago" : "usos pagos"}</p>
      {resposta && <p role="status" className={`sans mt-1 text-xs ${resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--muted)]"}`}>{resposta.texto}</p>}
    </div>
    {modo === "excluir" ? <div className="sans w-full rounded-[14px] border border-[var(--vinho)]/40 bg-[var(--vinho)]/[.04] p-4 text-sm md:w-auto md:max-w-md">
      <p><b className="font-medium">Excluir o {cupom.codigo}?</b> Não dá para desfazer: o código para de valer na hora.{cupom.usos > 0 ? ` ${cupom.usos === 1 ? "O pedido pago que usou continua" : `Os ${cupom.usos} pedidos pagos que usaram continuam`} com o desconto, mas sem mostrar o código.` : ""}{cupom.boas_vindas ? " O pop-up passa a só guardar o e-mail, sem mostrar cupom." : ""} Para só pausar, use “Desligar”.</p>
      <div className="mt-3 flex gap-2 text-[11px] uppercase tracking-[.12em]">
        <button type="button" disabled={salvando} onClick={() => setModo("ver")} className={botao}>Cancelar</button>
        <button type="button" disabled={salvando} onClick={() => startTransition(async () => { const resultado = await excluirCupom(cupom.codigo); setResposta(resultado); setModo("ver"); })} className="press h-10 rounded-full bg-[var(--vinho)] px-4 text-[var(--creme)]">{salvando ? "Excluindo…" : "Sim, excluir"}</button>
      </div>
    </div> : <div className="sans flex flex-wrap gap-2 text-[11px] uppercase tracking-[.12em]">
      {!cupom.boas_vindas && cupom.ativo && <button type="button" disabled={salvando} onClick={() => agir(() => cupomDoPopup(cupom.codigo))} className={botao}>Usar no pop-up</button>}
      <button type="button" disabled={salvando} onClick={() => { setResposta(null); setModo("editar"); }} className={botao}>Editar</button>
      <button type="button" disabled={salvando} onClick={() => agir(() => ligarCupom(cupom.codigo, !cupom.ativo))} className={`press h-10 rounded-full px-4 ${cupom.ativo ? "border border-[var(--line)] hover:bg-[var(--realce)]" : "bg-[var(--vinho)] text-[var(--creme)]"}`}>{cupom.ativo ? "Desligar" : "Ligar"}</button>
      <button type="button" disabled={salvando} onClick={() => { setResposta(null); setModo("excluir"); }} className={`${botao} text-[var(--vinho)]`}>Excluir</button>
    </div>}
  </li>;
}

export function CuponsAdmin({ cupons }: { cupons: CupomAdmin[] | null }) {
  const [resposta, criar, criando] = useActionState(criarCupom, null);
  if (cupons === null) return <section className="mt-24"><h2 className="display text-6xl">Cupons.</h2><p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver os cupons aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> na Vercel.</p></section>;
  const doPopup = cupons.find((cupom) => cupom.boas_vindas && cupom.ativo);
  return <section className="mt-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Descontos</p>
    <h2 className="display text-6xl">Cupons.</h2>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">O cliente digita o código no pagamento. {doPopup ? `O pop-up de primeira compra mostra o ${doPopup.codigo}.` : "Nenhum cupom está no pop-up: ele só guarda o e-mail, sem mostrar código."} Desligar um cupom faz ele parar de valer na hora; os pedidos que já usaram continuam como estão. Em cada cupom dá para editar (código, desconto, para que é, só 1ª compra) ou excluir de vez.</p>

    {cupons.length > 0 && <ul className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">{cupons.map((cupom) => <Cupom key={cupom.codigo} cupom={cupom} />)}</ul>}

    <form action={criar} className="mt-10 grid gap-4 md:grid-cols-[1fr_140px_2fr]">
      <label className="sans block text-[12px] text-[var(--muted)]">Código<input name="codigo" required minLength={3} maxLength={30} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="EX: AMIGO15" className={`${campo} uppercase tracking-[.06em]`} /></label>
      <label className="sans block text-[12px] text-[var(--muted)]">Desconto (%)<input name="percentual" required type="number" min={1} max={99} step={1} inputMode="numeric" placeholder="10" className={campo} /></label>
      <label className="sans block text-[12px] text-[var(--muted)]">Para que é (só vocês veem)<input name="descricao" maxLength={200} placeholder="Ex: homenagem ao…" className={campo} /></label>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-3">
        <label className="sans flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="primeira_compra" className="h-5 w-5 accent-[var(--vinho)]" /> Só vale na primeira compra de cada e-mail</label>
        <button type="submit" disabled={criando} className="sans press h-12 rounded-full bg-[var(--vinho)] px-7 text-[12px] uppercase tracking-[.14em] text-[var(--creme)] disabled:opacity-60">{criando ? "Criando…" : "Criar cupom"}</button>
        {resposta && <p role="status" className={`sans text-sm ${resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--muted)]"}`}>{resposta.texto}</p>}
      </div>
    </form>
  </section>;
}
