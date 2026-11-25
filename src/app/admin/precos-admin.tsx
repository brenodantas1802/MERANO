"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { salvarPreco, salvarTodos, type RespostaPreco } from "./precos-acoes";

// The price of each tee (and of the personalised one), as the shop shows and charges it. Read in page.tsx.
export type PrecoAdmin = { id: string; nome: string; imagem: string | null; preco: number; cheio: number | null };

const campo = "mt-1.5 block h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--campo)] px-3 text-[15px] tabular-nums outline-none focus:border-[var(--vinho)]/60";
const reais = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function Campos({ preco, cheio }: { preco?: number; cheio?: number | null }) {
  return <>
    <label className="sans block text-[12px] text-[var(--muted)]">Preço (R$)<input name="preco" required type="number" min={1} max={9999} step={0.01} inputMode="decimal" defaultValue={preco} placeholder="160" className={campo} /></label>
    <label className="sans block text-[12px] text-[var(--muted)]">Riscado (R$, opcional)<input name="cheio" type="number" min={1} max={9999} step={0.01} inputMode="decimal" defaultValue={cheio ?? ""} placeholder="vazio = sem riscado" className={campo} /></label>
  </>;
}

// One tee. After a save the list comes back with the new values (the row is keyed by them), so the message goes up.
function Linha({ item, avisar }: { item: PrecoAdmin; avisar: (resposta: RespostaPreco) => void }) {
  const [resposta, salvar, salvando] = useActionState(async (anterior: RespostaPreco, form: FormData) => {
    const resultado = await salvarPreco(item.id, anterior, form);
    if (resultado?.tipo === "ok") avisar({ tipo: "ok", texto: `${item.nome}: ${resultado.texto}` });
    return resultado;
  }, null);
  return <li className="py-4">
    <form action={salvar} className="grid grid-cols-[56px_1fr] items-end gap-x-4 gap-y-3 md:grid-cols-[56px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <span className="foto-gelo relative row-span-2 h-[68px] w-14 self-center overflow-hidden rounded-[10px] md:row-span-1">{item.imagem && <Image src={item.imagem} alt="" fill sizes="56px" className="object-cover" />}</span>
      <div className="min-w-0 self-center">
        <p className="truncate text-[16px]">{item.nome}</p>
        <p className="sans text-xs text-[var(--muted)]">Hoje: {reais(item.preco)}{item.cheio ? <> · <del>{reais(item.cheio)}</del> riscado</> : " · sem riscado"}</p>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-3 md:col-span-2"><Campos preco={item.preco} cheio={item.cheio} /></div>
      <button type="submit" disabled={salvando} className="press sans col-span-2 h-11 rounded-full bg-[var(--vinho)] px-6 text-[11px] uppercase tracking-[.12em] text-[var(--creme)] disabled:opacity-60 md:col-span-1">{salvando ? "Salvando…" : "Salvar"}</button>
      {resposta?.tipo === "erro" && <p role="alert" className="sans col-span-2 text-sm text-[var(--vinho)] md:col-span-5">{resposta.texto}</p>}
    </form>
  </li>;
}

export function PrecosAdmin({ precos }: { precos: PrecoAdmin[] }) {
  const [aviso, setAviso] = useState<RespostaPreco>(null);
  const [respostaTodos, aplicarTodos, aplicando] = useActionState(async (anterior: RespostaPreco, form: FormData) => {
    const resultado = await salvarTodos(anterior, form);
    if (resultado?.tipo === "ok") setAviso(resultado);
    return resultado;
  }, null);
  return <section className="mb-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Loja</p>
    <h2 className="display text-6xl">Preços.</h2>
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">O cliente paga o <b className="font-medium text-[var(--ink)]">Preço</b>. O <b className="font-medium text-[var(--ink)]">Riscado</b> aparece cortado ao lado; com ele, a camiseta ganha o selo “Pré-venda” e a faixa do topo do site mostra a oferta. Deixe o riscado vazio para não riscar nada. Muda no site na hora; quem já está com a página aberta vê o preço novo ao recarregar, e o pagamento sempre cobra o preço daqui.</p>

    <form action={aplicarTodos} className="mt-8 rounded-[20px] border border-[var(--line)] p-5">
      <p className="sans text-xs uppercase tracking-[.14em] text-[var(--muted)]">Todas de uma vez</p>
      <div className="mt-3 grid grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Campos />
        <button type="submit" disabled={aplicando} className="press sans col-span-2 h-11 rounded-full border border-[var(--ink)] px-6 text-[11px] uppercase tracking-[.12em] hover:bg-[var(--realce)] disabled:opacity-60 md:col-span-1">{aplicando ? "Aplicando…" : "Aplicar a todas"}</button>
      </div>
      {respostaTodos?.tipo === "erro" && <p role="alert" className="sans mt-3 text-sm text-[var(--vinho)]">{respostaTodos.texto}</p>}
    </form>

    {aviso && <p role="status" className="sans mt-6 text-sm text-[var(--ganho)]">{aviso.texto}</p>}
    <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {precos.map((item) => <Linha key={`${item.id}-${item.preco}-${item.cheio}`} item={item} avisar={setAviso} />)}
    </ul>
  </section>;
}
