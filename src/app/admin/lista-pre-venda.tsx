"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Copy, X } from "lucide-react";
import { adicionarNaLista, liberarPedido, recusarPedido, removerDaLista, type RespostaLista } from "./lista-acoes";

export type Autorizado = { id: string; nome: string | null; email: string | null; telefone: string | null; liberado_em: string | null; criado_em: string };
export type PedidoAcesso = { id: string; nome: string | null; email: string | null; telefone: string | null; status: "pendente" | "recusado"; criado_em: string };

const telefoneBonito = (telefone: string) => telefone.slice(2).replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");

function CopiarLink({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // The link stays visible and selectable.
    }
  }
  return <div className="mt-6 flex min-w-0 items-center gap-2">
    <code className="sans min-w-0 flex-1 select-all truncate rounded-full bg-[var(--areia)] px-4 py-3 text-[14px]">{link}</code>
    <button type="button" onClick={copiar} className="sans press flex h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--vinho)] px-5 text-[12px] uppercase tracking-[.12em] text-[var(--creme)]">{copiado ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar link</>}</button>
  </div>;
}

function Pessoa({ pessoa }: { pessoa: Autorizado }) {
  const [removendo, startTransition] = useTransition();
  const contato = [pessoa.email, pessoa.telefone && telefoneBonito(pessoa.telefone)].filter(Boolean).join(" · ");
  return <li className={`flex flex-wrap items-center justify-between gap-3 py-3 ${removendo ? "opacity-40" : ""}`}>
    <div className="min-w-0">
      <p className="truncate text-[16px]">{pessoa.nome || contato}</p>
      <p className="sans truncate text-xs text-[var(--muted)]">{pessoa.nome ? `${contato} · ` : ""}{pessoa.liberado_em ? `entrou em ${new Date(pessoa.liberado_em).toLocaleDateString("pt-BR")}` : "ainda não entrou"}</p>
    </div>
    <button type="button" disabled={removendo} onClick={() => startTransition(() => removerDaLista(pessoa.id))} aria-label={`Tirar ${pessoa.nome || contato} da lista`} className="press flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--realce)] hover:text-[var(--ink)]"><X size={16} /></button>
  </li>;
}

// Someone who signed in on /pre-venda without being on the list, with the WhatsApp they typed. "Liberar" puts the
// account on the list (their page opens by itself if still open); "Recusar" tells them it wasn't let in.
function Pedido({ pedido }: { pedido: PedidoAcesso }) {
  const [salvando, startTransition] = useTransition();
  const [resposta, setResposta] = useState<RespostaLista>(null);
  const agir = (acao: (id: string) => Promise<RespostaLista>) => startTransition(async () => setResposta(await acao(pedido.id)));
  const quando = new Date(pedido.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  return <li className={`flex flex-wrap items-center justify-between gap-3 py-4 ${salvando ? "opacity-50" : ""}`}>
    <div className="min-w-0">
      <p className="truncate text-[16px]">{pedido.nome || pedido.email || "Sem nome"}</p>
      <p className="sans truncate text-xs text-[var(--muted)]">{[pedido.email, pedido.telefone && telefoneBonito(pedido.telefone)].filter(Boolean).join(" · ")} · pediu em {quando}</p>
      {resposta?.tipo === "erro" && <p role="alert" className="sans mt-1 text-xs text-[var(--vinho)]">{resposta.texto}</p>}
    </div>
    <div className="sans flex flex-wrap gap-2 text-[11px] uppercase tracking-[.12em]">
      {pedido.telefone && <a href={`https://wa.me/${pedido.telefone}`} target="_blank" rel="noopener noreferrer" className="press flex h-11 items-center rounded-full border border-[var(--line)] px-4 hover:bg-[var(--realce)]">WhatsApp</a>}
      {pedido.status === "pendente" && <button type="button" disabled={salvando} onClick={() => agir(recusarPedido)} className="press h-11 rounded-full border border-[var(--line)] px-4 hover:bg-[var(--realce)]">Recusar</button>}
      <button type="button" disabled={salvando} onClick={() => agir(liberarPedido)} className="press h-11 rounded-full bg-[var(--vinho)] px-5 text-[var(--creme)]">Liberar</button>
    </div>
  </li>;
}

// Pre-sale: the link for the WhatsApp group and the list of who may enter (e-mail or WhatsApp of each person).
export function ListaPreVenda({ lista, pedidos, origem, cadeadoLigado }: { lista: Autorizado[] | null; pedidos: PedidoAcesso[]; origem: string; cadeadoLigado: boolean }) {
  const pendentes = pedidos.filter((pedido) => pedido.status === "pendente");
  const recusados = pedidos.filter((pedido) => pedido.status === "recusado");
  const [resposta, adicionar, salvando] = useActionState(adicionarNaLista, null);
  const entraram = lista?.filter((pessoa) => pessoa.liberado_em).length ?? 0;
  return <section className="mb-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Pré-venda</p>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="display text-6xl">Quem pode entrar.</h2>
      <span className={`sans rounded-full px-4 py-2 text-[11px] uppercase tracking-[.14em] ${cadeadoLigado ? "bg-[var(--vinho)] text-[var(--creme)]" : "bg-[var(--areia)] text-[var(--ink)]"}`}>Cadeado {cadeadoLigado ? "ligado" : "desligado"}</span>
    </div>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">Mande este link no grupo. A pessoa entra com o Google ou cria a conta. Se o e-mail ou o WhatsApp dela estiver na lista abaixo, a conta é liberada na hora e para sempre; se não estiver, ela manda um pedido com o WhatsApp e aparece em “Pedidos de acesso” para vocês liberarem. Vocês, donos, já estão liberados. {cadeadoLigado ? "O site está trancado para quem não está na lista." : "O cadeado está desligado: o site está aberto para todo mundo (liga com PRE_VENDA=1 na Vercel)."}</p>
    <CopiarLink link={`${origem}/pre-venda`} />

    {lista === null ? <p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para usar a lista, cadastre a variável <code>SUPABASE_SECRET_KEY</code> (chave secreta do Supabase) na Vercel.</p> : <>
      <div className={`mt-8 rounded-[20px] border px-5 py-2 ${pendentes.length ? "border-[var(--vinho)]/40 bg-[var(--vinho)]/[.04]" : "border-[var(--line)]"}`}>
        <p className="sans pt-3 text-xs uppercase tracking-[.14em] text-[var(--muted)]">Pedidos de acesso · {pendentes.length} {pendentes.length === 1 ? "esperando" : "esperando"}</p>
        {pendentes.length ? <ul className="divide-y divide-[var(--line)]">{pendentes.map((pedido) => <Pedido key={pedido.id} pedido={pedido} />)}</ul>
          : <p className="sans py-3 text-sm text-[var(--muted)]">Ninguém esperando. Quem entrar pelo link sem estar na lista aparece aqui.</p>}
        {recusados.length > 0 && <details className="sans border-t border-[var(--line)] py-3 text-sm">
          <summary className="cursor-pointer text-xs uppercase tracking-[.14em] text-[var(--muted)]">Recusados · {recusados.length}</summary>
          <ul className="divide-y divide-[var(--line)]">{recusados.map((pedido) => <Pedido key={pedido.id} pedido={pedido} />)}</ul>
        </details>}
      </div>
      <form action={adicionar} className="mt-8 border-y border-[var(--line)] py-6">
        <label className="sans block text-[12px] text-[var(--muted)]">Adicionar pessoas · uma por linha, com e-mail ou WhatsApp (o nome é opcional)
          <textarea name="lista" required rows={5} placeholder={"Ana Souza, 11 98765-4321\npedro@gmail.com\nMateus - (21) 99999-0000"} className="sans mt-3 block w-full rounded-[14px] border border-[var(--line)] bg-[var(--campo)] p-4 text-[15px] leading-relaxed outline-none focus:border-[var(--vinho)]/60" />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={salvando} className="sans press h-12 rounded-full bg-[var(--vinho)] px-7 text-[12px] uppercase tracking-[.14em] text-[var(--creme)] disabled:opacity-60">{salvando ? "Salvando…" : "Adicionar à lista"}</button>
          {resposta && <p role="status" className={`sans text-sm ${resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--muted)]"}`}>{resposta.texto}</p>}
        </div>
      </form>
      <p className="sans mt-6 text-xs uppercase tracking-[.14em] text-[var(--muted)]">{lista.length} na lista · {entraram} já {entraram === 1 ? "entrou" : "entraram"}</p>
      {lista.length > 0 && <ul className="mt-2 divide-y divide-[var(--line)] border-b border-[var(--line)]">{lista.map((pessoa) => <Pessoa key={pessoa.id} pessoa={pessoa} />)}</ul>}
    </>}
  </section>;
}
