"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Download, Package, Search } from "lucide-react";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/pedido-status";
import type { Pedido } from "@/lib/pedidos";
import { formatPrice } from "@/lib/products";
import { mudarStatusPedido, salvarRastreio, type Resposta } from "./pedidos-acoes";

// The real orders, newest first: filter, search, change the status, add the tracking code, copy the shipping data.
const FILTROS: { id: string; nome: string; status: StatusPedido[] }[] = [
  { id: "todos", nome: "Todos", status: [] },
  { id: "aguardando", nome: "Aguardando pagamento", status: ["aguardando_pagamento"] },
  { id: "despachar", nome: "Para despachar", status: ["pago", "em_separacao"] },
  { id: "enviados", nome: "Enviados", status: ["enviado"] },
  { id: "entregues", nome: "Entregues", status: ["entregue"] },
  { id: "cancelados", nome: "Cancelados", status: ["cancelado"] },
];

const COR: Record<StatusPedido, string> = {
  aguardando_pagamento: "bg-[var(--areia)] text-[var(--ink)]",
  pago: "bg-[var(--vinho)] text-[var(--creme)]",
  em_separacao: "bg-[var(--vinho)]/80 text-[var(--creme)]",
  enviado: "bg-[#1f6e4a] text-white",
  entregue: "bg-[#1f6e4a]/15 text-[#1f6e4a]",
  cancelado: "bg-[var(--line)] text-[var(--muted)] line-through",
};

const PAGOS: StatusPedido[] = ["pago", "em_separacao", "enviado", "entregue"];
const data = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const soDigitos = (valor: string) => valor.replace(/\D/g, "");
const cpfBonito = (cpf: string) => soDigitos(cpf).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
const celularBonito = (celular: string) => soDigitos(celular).replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
const cepBonito = (cep: string) => soDigitos(cep).replace(/^(\d{5})(\d{3})$/, "$1-$2");
const reais = (valor: unknown) => Number(valor ?? 0).toFixed(2).replace(".", ",");
const formaPagamento = (pedido: Pedido) => pedido.metodo === "whatsapp" ? "WhatsApp" : pedido.metodo === "pix" ? "Pix (Mercado Pago)" : "Cartão (Mercado Pago)";

function dadosDeEnvio(pedido: Pedido) {
  const e = pedido.endereco;
  return [pedido.cliente.nome, `CPF ${cpfBonito(pedido.cliente.cpf)}`, `${e.rua}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ""}`, `${e.bairro} — ${e.cidade}/${e.uf}`, `CEP ${cepBonito(e.cep)}`, `Celular ${celularBonito(pedido.cliente.celular)}`].join("\n");
}

function baixarCsv(pedidos: Pedido[]) {
  const celula = (valor: unknown) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const linhas = [["Pedido", "Data", "Status", "Cliente", "E-mail", "Celular", "CPF", "Peças", "Subtotal", "Cupom", "Desconto cupom", "Desconto Pix", "Frete", "Valor frete", "Total", "Pagamento", "CEP", "Endereço", "Cidade", "UF", "Rastreio"]];
  for (const p of pedidos) linhas.push([p.numero, new Date(p.criado_em).toLocaleString("pt-BR"), STATUS_PEDIDO[p.status], p.cliente.nome, p.email, celularBonito(p.cliente.celular), cpfBonito(p.cliente.cpf),
    p.itens.map((item) => `${item.quantidade}x ${item.nome} ${item.tamanho}${item.cor ? ` ${item.cor}` : ""}`).join(" + "), reais(p.subtotal), p.cupom ?? "", reais(p.desconto_cupom), reais(p.desconto_pix),
    p.frete?.nome ?? "", reais(p.frete?.preco), reais(p.total), formaPagamento(p), cepBonito(p.endereco.cep), `${p.endereco.rua}, ${p.endereco.numero} ${p.endereco.complemento} — ${p.endereco.bairro}`, p.endereco.cidade, p.endereco.uf, p.rastreio ?? ""]);
  // BOM + semicolons: opens straight in Excel in Portuguese.
  const csv = "﻿" + linhas.map((linha) => linha.map(celula).join(";")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `pedidos-meranno-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function Copiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [feito, setFeito] = useState(false);
  return <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(texto); setFeito(true); setTimeout(() => setFeito(false), 1800); } catch { /* text stays visible */ } }}
    className="sans press inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] px-4 text-[11px] uppercase tracking-[.12em] hover:bg-[var(--creme)]">{feito ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> {rotulo}</>}</button>;
}

function Linha({ pedido }: { pedido: Pedido }) {
  const [salvando, startTransition] = useTransition();
  const [resposta, setResposta] = useState<Resposta>(null);
  const [rastreio, setRastreio] = useState(pedido.rastreio ?? "");
  const celular = soDigitos(pedido.cliente.celular);
  const pecas = pedido.itens.reduce((soma, item) => soma + item.quantidade, 0);
  const agir = (acao: () => Promise<Resposta>) => startTransition(async () => setResposta(await acao()));

  return <details className={`group border-b border-[var(--line)] ${salvando ? "opacity-60" : ""}`}>
    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-5 gap-y-2 py-4 [&::-webkit-details-marker]:hidden">
      <span className="sans w-24 shrink-0 text-xs font-semibold tracking-[.06em]">{pedido.numero}</span>
      <span className="min-w-0 flex-1 truncate text-lg">{pedido.cliente.nome}</span>
      <span className="sans hidden text-xs text-[var(--muted)] md:inline">{pecas} {pecas === 1 ? "peça" : "peças"} · {data(pedido.criado_em)}</span>
      <span className={`sans rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[.1em] ${COR[pedido.status]}`}>{STATUS_PEDIDO[pedido.status]}</span>
      <span className="sans w-24 text-right text-sm tabular-nums">{formatPrice(Number(pedido.total))}</span>
    </summary>
    <div className="grid gap-8 pb-8 pt-2 md:grid-cols-3">
      <div className="sans space-y-1 text-sm">
        <p className="mb-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">Peças</p>
        {pedido.itens.map((item, indice) => <p key={indice}>{item.quantidade}× {item.nome} · <b>{item.tamanho}</b>{item.cor ? ` · ${item.cor}` : ""}{item.criacaoId ? " · personalizada" : ""}</p>)}
        <p className="pt-3 text-[var(--muted)]">Subtotal {formatPrice(Number(pedido.subtotal))}{pedido.cupom ? ` · cupom ${pedido.cupom} −${formatPrice(Number(pedido.desconto_cupom))}` : ""}{Number(pedido.desconto_pix) > 0 ? ` · Pix −${formatPrice(Number(pedido.desconto_pix))}` : ""} · {pedido.frete?.nome} {formatPrice(Number(pedido.frete?.preco ?? 0))}</p>
        <p className="text-[var(--muted)]">{formaPagamento(pedido)}{pedido.pagamento?.status ? ` · Mercado Pago: ${pedido.pagamento.status}` : ""}</p>
      </div>
      <div className="sans space-y-1 text-sm">
        <p className="mb-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">Entrega</p>
        <p className="whitespace-pre-line">{dadosDeEnvio(pedido)}</p>
        <p><a className="underline underline-offset-4" href={`mailto:${pedido.email}`}>{pedido.email}</a></p>
        <div className="flex flex-wrap gap-2 pt-3">
          <Copiar texto={dadosDeEnvio(pedido)} rotulo="Copiar dados de envio" />
          {celular && <a href={`https://wa.me/55${celular}?text=${encodeURIComponent(`Olá, ${pedido.cliente.nome.split(" ")[0]}! Aqui é da Meranno, sobre o pedido ${pedido.numero}.`)}`} target="_blank" rel="noopener noreferrer" className="sans press inline-flex h-10 items-center rounded-full bg-[#1f9e55] px-4 text-[11px] uppercase tracking-[.12em] text-white">WhatsApp do cliente</a>}
        </div>
      </div>
      <div className="sans space-y-4 text-sm">
        <label className="block text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">Status
          <select value={pedido.status} disabled={salvando} onChange={(event) => agir(() => mudarStatusPedido(pedido.id, event.target.value))} className="mt-2 block h-11 w-full rounded-[12px] border border-[var(--line)] bg-white/70 px-3 text-sm normal-case tracking-normal text-[var(--ink)]">
            {Object.entries(STATUS_PEDIDO).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </select>
        </label>
        <form onSubmit={(event) => { event.preventDefault(); agir(() => salvarRastreio(pedido.id, rastreio)); }} className="block">
          <label className="block text-[11px] uppercase tracking-[.14em] text-[var(--muted)]" htmlFor={`rastreio-${pedido.id}`}>Código de rastreio</label>
          <div className="mt-2 flex gap-2">
            <input id={`rastreio-${pedido.id}`} value={rastreio} onChange={(event) => setRastreio(event.target.value)} placeholder="AA123456789BR" className="h-11 min-w-0 flex-1 rounded-[12px] border border-[var(--line)] bg-white/70 px-3 uppercase" />
            <button type="submit" disabled={salvando} className="press h-11 shrink-0 rounded-full bg-[var(--vinho)] px-4 text-[11px] uppercase tracking-[.12em] text-[var(--creme)]">Salvar</button>
          </div>
        </form>
        {resposta && <p role="status" className={resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--muted)]"}>{resposta.texto}</p>}
        <Link href={`/pedido/${pedido.id}`} target="_blank" className="inline-block text-[12px] uppercase tracking-[.12em] text-[var(--muted)] underline underline-offset-4">Página do cliente</Link>
      </div>
    </div>
  </details>;
}

export function PedidosAdmin({ pedidos }: { pedidos: Pedido[] | null }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const lista = useMemo(() => {
    if (!pedidos) return [];
    const status = FILTROS.find((item) => item.id === filtro)?.status ?? [];
    const termo = busca.trim().toLowerCase();
    const digitos = soDigitos(termo);
    return pedidos.filter((pedido) => (!status.length || status.includes(pedido.status))
      && (!termo || [pedido.numero, pedido.cliente.nome, pedido.email].some((campo) => campo.toLowerCase().includes(termo)) || (digitos.length >= 4 && soDigitos(pedido.cliente.celular).includes(digitos))));
  }, [pedidos, filtro, busca]);

  if (pedidos === null) return <section className="mb-24"><h2 className="display text-6xl">Pedidos.</h2><p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver os pedidos aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> na Vercel.</p></section>;

  const contar = (status: StatusPedido[]) => pedidos.filter((pedido) => status.includes(pedido.status)).length;
  const recebido = pedidos.filter((pedido) => PAGOS.includes(pedido.status)).reduce((soma, pedido) => soma + Number(pedido.total), 0);
  const pecasPagas = pedidos.filter((pedido) => PAGOS.includes(pedido.status)).reduce((soma, pedido) => soma + pedido.itens.reduce((total, item) => total + item.quantidade, 0), 0);

  return <section className="mb-24">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Operação</p>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="display text-7xl">Pedidos.</h2>
      <span className="sans flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]"><Package size={15} /> {contar(["pago", "em_separacao"])} para despachar · {contar(["aguardando_pagamento"])} aguardando pagamento</span>
    </div>
    <p className="sans mt-4 text-sm text-[var(--muted)]">Pagos até agora: <b className="text-[var(--ink)]">{formatPrice(recebido)}</b> · {pecasPagas} {pecasPagas === 1 ? "peça" : "peças"}. Pedidos fechados pelo WhatsApp entram como “Aguardando pagamento”: quando o Pix cair, mude para “Pago”.</p>

    <div className="mt-8 flex flex-wrap gap-2">
      {FILTROS.map((item) => <button key={item.id} type="button" onClick={() => setFiltro(item.id)} className={`sans press h-10 rounded-full px-4 text-[11px] uppercase tracking-[.12em] ${filtro === item.id ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"}`}>{item.nome}{item.status.length ? ` · ${contar(item.status)}` : ` · ${pedidos.length}`}</button>)}
    </div>
    <div className="mt-6 flex items-center gap-4 border-b border-[var(--line)] pb-3">
      <Search size={15} className="text-[var(--muted)]" />
      <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por pedido, nome, e-mail ou celular" className="sans min-w-0 flex-1 bg-transparent text-sm outline-none" />
      <button type="button" onClick={() => baixarCsv(lista)} disabled={!lista.length} className="sans press inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--line)] px-4 text-[11px] uppercase tracking-[.12em] disabled:opacity-40"><Download size={13} /> Planilha</button>
    </div>
    {lista.length === 0 ? <p className="sans mt-8 text-sm text-[var(--muted)]">{pedidos.length ? "Nenhum pedido com esse filtro." : "Nenhum pedido ainda."}</p>
      : <div className="mt-2">{lista.map((pedido) => <Linha key={pedido.id} pedido={pedido} />)}</div>}
  </section>;
}
