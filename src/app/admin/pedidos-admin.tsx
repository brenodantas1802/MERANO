"use client";

import { createContext, useActionState, useContext, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Download, Package, Search } from "lucide-react";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/pedido-status";
import type { Pedido } from "@/lib/pedidos";
import { formatPrice, getProduct } from "@/lib/products";
import { cancelarPedidoEquipe, editarPedido, mudarStatusPedido, salvarRastreio, type Resposta } from "./pedidos-acoes";

// The real orders, newest first, saved the moment the customer finishes the checkout: filter, search, see them one by
// one or by customer, change the status, add the tracking code, fix the data, cancel with the refund (owners, 2026-11-25).
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
  entregue: "bg-[var(--ganho)]/15 text-[var(--ganho)]",
  cancelado: "bg-[var(--line)] text-[var(--muted)] line-through",
};

const PAGOS: StatusPedido[] = ["pago", "em_separacao", "enviado", "entregue"];
const SP = "America/Sao_Paulo";
const data = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: SP }).replace(", ", " às ");
const soDigitos = (valor: string) => valor.replace(/\D/g, "");

// Who the buyer is on the pre-sale list ("Felipe Brasil · Amigos"), by the account e-mail or the WhatsApp. Built in
// page.tsx; keys are lowercase e-mails and numbers with the country code.
const Quem = createContext<Record<string, string>>({});
function useQuem(pedido: Pedido) {
  const quem = useContext(Quem);
  const celular = soDigitos(pedido.cliente.celular);
  return quem[pedido.email.toLowerCase()] ?? quem[celular.length >= 12 && celular.startsWith("55") ? celular : `55${celular}`] ?? null;
}
const SeloLista = ({ texto }: { texto: string | null }) => texto ? <span className="sans inline-block rounded-full bg-[var(--vinho)] px-2.5 py-0.5 align-middle text-[10px] uppercase tracking-[.1em] text-[var(--creme)]">{texto}</span> : null;
const cpfBonito = (cpf: string) => soDigitos(cpf).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
const celularBonito = (celular: string) => soDigitos(celular).replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
const cepBonito = (cep: string) => soDigitos(cep).replace(/^(\d{5})(\d{3})$/, "$1-$2");
const reais = (valor: unknown) => Number(valor ?? 0).toFixed(2).replace(".", ",");
const NOMES_PROVEDOR: Record<string, string> = { asaas: "Asaas" };
const provedorDo = (pedido: Pedido) => NOMES_PROVEDOR[pedido.pagamento?.provedor ?? ""] ?? "on-line";
const formaPagamento = (pedido: Pedido) => pedido.metodo === "whatsapp" ? "WhatsApp" : `${pedido.metodo === "pix" ? "Pix" : "Cartão"} (${provedorDo(pedido)})`;
const pecasDo = (pedido: Pedido) => pedido.itens.reduce((soma, item) => soma + item.quantidade, 0);
const botao = "sans press inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[11px] uppercase tracking-[.12em] hover:bg-[var(--realce)]";
const campo = "mt-1 block h-11 w-full rounded-[10px] border border-[var(--line)] bg-[var(--campo)] px-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--vinho)]";
const rotulo = "sans block text-[11px] uppercase tracking-[.12em] text-[var(--muted)]";

function dadosDeEnvio(pedido: Pedido) {
  const e = pedido.endereco;
  return [pedido.cliente.nome, `CPF ${cpfBonito(pedido.cliente.cpf)}`, `${e.rua}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ""}`, `${e.bairro} — ${e.cidade}/${e.uf}`, `CEP ${cepBonito(e.cep)}`, `Celular ${celularBonito(pedido.cliente.celular)}`].join("\n");
}

function baixarCsv(pedidos: Pedido[]) {
  const celula = (valor: unknown) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const linhas = [["Pedido", "Data", "Status", "Cliente", "E-mail", "Celular", "CPF", "Peças", "Subtotal", "Cupom", "Desconto cupom", "Desconto Pix", "Frete", "Valor frete", "Total", "Pagamento", "CEP", "Endereço", "Cidade", "UF", "Rastreio"]];
  for (const p of pedidos) linhas.push([p.numero, data(p.criado_em), STATUS_PEDIDO[p.status], p.cliente.nome, p.email, celularBonito(p.cliente.celular), cpfBonito(p.cliente.cpf),
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

function Copiar({ texto, nome }: { texto: string; nome: string }) {
  const [feito, setFeito] = useState(false);
  return <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(texto); setFeito(true); setTimeout(() => setFeito(false), 1800); } catch { /* text stays visible */ } }}
    className={botao}>{feito ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> {nome}</>}</button>;
}

// The order's customer and delivery data and the size of each piece, editable (pedidos-acoes editarPedido).
function EditarPedido({ pedido, fechar }: { pedido: Pedido; fechar: (resposta: Resposta) => void }) {
  const [resposta, salvar, salvando] = useActionState(async (anterior: Resposta, form: FormData) => {
    const resultado = await editarPedido(pedido.id, anterior, form);
    if (resultado?.tipo === "ok") fechar(resultado);
    return resultado;
  }, null);
  const c = pedido.cliente;
  const e = pedido.endereco;
  const tamanhos = (item: Pedido["itens"][number]) => (item.productId ? getProduct(item.productId)?.fits : undefined) ?? ["P", "M", "G"];
  return <form action={salvar} className="sans mt-2 grid gap-3 rounded-[18px] bg-[var(--cartao)] p-4 md:grid-cols-6">
    <label className={`${rotulo} md:col-span-3`}>Nome<input name="nome" defaultValue={c.nome} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-3`}>E-mail<input name="email" type="email" defaultValue={pedido.email} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-2`}>Celular<input name="celular" inputMode="tel" defaultValue={celularBonito(c.celular)} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-2`}>CPF<input name="cpf" inputMode="numeric" defaultValue={cpfBonito(c.cpf)} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-2`}>CEP<input name="cep" inputMode="numeric" defaultValue={cepBonito(e.cep)} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-4`}>Rua<input name="rua" defaultValue={e.rua} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-2`}>Número<input name="numero" defaultValue={e.numero} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-2`}>Complemento<input name="complemento" defaultValue={e.complemento} className={campo} /></label>
    <label className={`${rotulo} md:col-span-2`}>Bairro<input name="bairro" defaultValue={e.bairro} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-1`}>Cidade<input name="cidade" defaultValue={e.cidade} required className={campo} /></label>
    <label className={`${rotulo} md:col-span-1`}>UF<input name="uf" defaultValue={e.uf} maxLength={2} required className={`${campo} uppercase`} /></label>
    {pedido.itens.map((item, indice) => <label key={indice} className={`${rotulo} md:col-span-3`}>Tamanho · {item.quantidade}× {item.nome}
      <select name={`tamanho_${indice}`} defaultValue={item.tamanho} className={campo}>{tamanhos(item).map((tamanho) => <option key={tamanho}>{tamanho}</option>)}</select>
    </label>)}
    <div className="flex flex-wrap items-center gap-2 md:col-span-6">
      <button type="button" onClick={() => fechar(null)} className={botao}>Cancelar edição</button>
      <button type="submit" disabled={salvando} className="press h-10 rounded-full bg-[var(--vinho)] px-5 text-[11px] uppercase tracking-[.12em] text-[var(--creme)] disabled:opacity-60">{salvando ? "Salvando…" : "Salvar dados"}</button>
      {resposta?.tipo === "erro" && <p role="alert" className="text-sm text-[var(--vinho)]">{resposta.texto}</p>}
    </div>
  </form>;
}

// Cancel, with a second tap that says what happens to the money.
function Cancelar({ pedido, agir, salvando }: { pedido: Pedido; agir: (acao: () => Promise<Resposta>) => void; salvando: boolean }) {
  const [confirmando, setConfirmando] = useState(false);
  const pago = PAGOS.includes(pedido.status);
  const estornaSozinho = pago && pedido.pagamento?.provedor === "asaas";
  if (pedido.status === "cancelado") return null;
  if (!confirmando) return <button type="button" onClick={() => setConfirmando(true)} className={`${botao} text-[var(--vinho)]`}>{estornaSozinho ? "Cancelar e estornar" : "Cancelar pedido"}</button>;
  return <div className="rounded-[16px] border border-[var(--vinho)]/40 bg-[var(--vinho)]/[.05] p-4 text-sm">
    <p><b className="font-medium">Cancelar o pedido {pedido.numero}?</b> {estornaSozinho ? `Os ${formatPrice(Number(pedido.total))} voltam agora pelo Asaas para onde o cliente pagou (Pix: precisa ter saldo no Asaas; cartão: crédito na fatura).` : pago ? "O pagamento não foi pelo Asaas: o estorno é com vocês." : "Ele ainda não foi pago: só sai da lista."} Não dá para desfazer.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={() => setConfirmando(false)} className={botao}>Voltar</button>
      <button type="button" disabled={salvando} onClick={() => { setConfirmando(false); agir(() => cancelarPedidoEquipe(pedido.id)); }} className="press h-10 rounded-full bg-[var(--vinho)] px-5 text-[11px] uppercase tracking-[.12em] text-[var(--creme)]">{estornaSozinho ? "Sim, cancelar e estornar" : "Sim, cancelar"}</button>
    </div>
  </div>;
}

function Linha({ pedido, comCliente = true }: { pedido: Pedido; comCliente?: boolean }) {
  const [salvando, startTransition] = useTransition();
  const [resposta, setResposta] = useState<Resposta>(null);
  const [rastreio, setRastreio] = useState(pedido.rastreio ?? "");
  const [editando, setEditando] = useState(false);
  const celular = soDigitos(pedido.cliente.celular);
  const pecas = pecasDo(pedido);
  const agir = (acao: () => Promise<Resposta>) => startTransition(async () => setResposta(await acao()));
  const estorno = pedido.pagamento?.estorno;
  const naLista = useQuem(pedido);

  return <details className={`group rounded-[20px] bg-[var(--paper)] px-4 shadow-[0_10px_30px_-24px_rgba(20,17,16,.5)] md:px-6 ${salvando ? "opacity-60" : ""}`}>
    <summary className="flex cursor-pointer list-none flex-col gap-1.5 py-4 [&::-webkit-details-marker]:hidden">
      <span className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[17px]">{comCliente ? <>{pedido.cliente.nome} <SeloLista texto={naLista} /></> : `${pecas} ${pecas === 1 ? "peça" : "peças"} · ${formaPagamento(pedido)}`}</span>
        <span className="sans shrink-0 text-[15px] tabular-nums">{formatPrice(Number(pedido.total))}</span>
      </span>
      <span className="sans flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
        <span className="font-semibold tracking-[.06em] text-[var(--ink)]">{pedido.numero}</span>
        <span>Feito em {data(pedido.criado_em)}{comCliente ? ` · ${pecas} ${pecas === 1 ? "peça" : "peças"}` : ""}</span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[.1em] ${COR[pedido.status]}`}>{STATUS_PEDIDO[pedido.status]}</span>
      </span>
    </summary>
    <div className="grid gap-6 pb-6 pt-1 md:grid-cols-3">
      <div className="sans space-y-1 text-sm">
        <p className="mb-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">Peças</p>
        {pedido.itens.map((item, indice) => <p key={indice}>{item.quantidade}× {item.nome} · <b>{item.tamanho}</b>{item.cor ? ` · ${item.cor}` : ""}{item.criacaoId ? " · personalizada" : ""} · {formatPrice(Number(item.preco))}</p>)}
        <p className="pt-3 text-[var(--muted)]">Subtotal {formatPrice(Number(pedido.subtotal))}{pedido.cupom ? ` · cupom ${pedido.cupom} −${formatPrice(Number(pedido.desconto_cupom))}` : ""}{Number(pedido.desconto_pix) > 0 ? ` · Pix −${formatPrice(Number(pedido.desconto_pix))}` : ""} · {pedido.frete?.nome} {formatPrice(Number(pedido.frete?.preco ?? 0))}</p>
        <p className="text-[var(--muted)]">{formaPagamento(pedido)}{pedido.pagamento?.status ? ` · ${provedorDo(pedido)}: ${pedido.pagamento.status}` : ""}</p>
        {pedido.status === "cancelado" && <p className="pt-2 text-[var(--vinho)]">Cancelado{pedido.pagamento?.cancelado_em ? ` em ${data(pedido.pagamento.cancelado_em)}` : ""}{pedido.pagamento?.cancelado_por ? ` por ${pedido.pagamento.cancelado_por === "cliente" ? "o cliente" : pedido.pagamento.cancelado_por}` : ""}{estorno ? ` · estorno de ${formatPrice(estorno.valor)} pelo Asaas` : ""}.</p>}
      </div>
      <div className="sans space-y-1 text-sm">
        <p className="mb-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]">Cliente e entrega</p>
        <p className="whitespace-pre-line">{dadosDeEnvio(pedido)}</p>
        <p><a className="underline underline-offset-4" href={`mailto:${pedido.email}`}>{pedido.email}</a></p>
        <div className="flex flex-wrap gap-2 pt-3">
          <Copiar texto={dadosDeEnvio(pedido)} nome="Copiar envio" />
          {celular && <a href={`https://wa.me/55${celular}?text=${encodeURIComponent(`Olá, ${pedido.cliente.nome.split(" ")[0]}! Aqui é da Meranno, sobre o pedido ${pedido.numero}.`)}`} target="_blank" rel="noopener noreferrer" className="sans press inline-flex h-10 items-center rounded-full bg-[#1f9e55] px-4 text-[11px] uppercase tracking-[.12em] text-white">WhatsApp</a>}
          {!editando && <button type="button" onClick={() => { setResposta(null); setEditando(true); }} className={botao}>Editar dados</button>}
        </div>
      </div>
      <div className="sans space-y-4 text-sm">
        <label className={rotulo}>Status
          <select value={pedido.status} disabled={salvando} onChange={(event) => agir(() => mudarStatusPedido(pedido.id, event.target.value))} className={campo}>
            {Object.entries(STATUS_PEDIDO).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </select>
        </label>
        <form onSubmit={(event) => { event.preventDefault(); agir(() => salvarRastreio(pedido.id, rastreio)); }} className="block">
          <label className={rotulo} htmlFor={`rastreio-${pedido.id}`}>Código de rastreio</label>
          <div className="mt-1 flex gap-2">
            <input id={`rastreio-${pedido.id}`} value={rastreio} onChange={(event) => setRastreio(event.target.value)} placeholder="AA123456789BR" className={`${campo} mt-0 min-w-0 flex-1 uppercase`} />
            <button type="submit" disabled={salvando} className="press h-11 shrink-0 rounded-full bg-[var(--vinho)] px-4 text-[11px] uppercase tracking-[.12em] text-[var(--creme)]">Salvar</button>
          </div>
        </form>
        <Cancelar pedido={pedido} agir={agir} salvando={salvando} />
        {resposta && <p role="status" className={resposta.tipo === "erro" ? "text-[var(--vinho)]" : "text-[var(--ganho)]"}>{resposta.texto}</p>}
        <Link href={`/pedido/${pedido.id}`} target="_blank" className="inline-block text-[12px] uppercase tracking-[.12em] text-[var(--muted)] underline underline-offset-4">Página do cliente</Link>
      </div>
    </div>
    {editando && <div className="pb-6"><EditarPedido pedido={pedido} fechar={(resultado) => { setEditando(false); if (resultado) setResposta(resultado); }} /></div>}
  </details>;
}

// One customer (same e-mail): who they are, what they bought, and each of their orders.
function Cliente({ pedidos }: { pedidos: Pedido[] }) {
  const [primeiro] = pedidos;
  const naLista = useQuem(primeiro);
  const pagos = pedidos.filter((pedido) => PAGOS.includes(pedido.status));
  const gasto = pagos.reduce((soma, pedido) => soma + Number(pedido.total), 0);
  const pecas = pagos.reduce((soma, pedido) => soma + pecasDo(pedido), 0);
  return <div className="rounded-[24px] bg-[var(--paper)] p-4 shadow-[0_10px_30px_-24px_rgba(20,17,16,.5)] md:p-6">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="text-xl">{primeiro.cliente.nome} <SeloLista texto={naLista} /></p>
      <p className="sans text-sm tabular-nums">{formatPrice(gasto)} <span className="text-[var(--muted)]">em {pecas} {pecas === 1 ? "peça paga" : "peças pagas"}</span></p>
    </div>
    <p className="sans mt-1 text-xs text-[var(--muted)]">{primeiro.email} · {celularBonito(primeiro.cliente.celular)} · CPF {cpfBonito(primeiro.cliente.cpf)} · {primeiro.endereco.cidade}/{primeiro.endereco.uf} · {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}</p>
    <div className="mt-3 space-y-2 rounded-[18px] bg-[var(--cartao)] p-2">{pedidos.map((pedido) => <Linha key={pedido.id} pedido={pedido} comCliente={false} />)}</div>
  </div>;
}

export function PedidosAdmin({ pedidos, quem = {} }: { pedidos: Pedido[] | null; quem?: Record<string, string> }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [porCliente, setPorCliente] = useState(false);
  const lista = useMemo(() => {
    if (!pedidos) return [];
    const status = FILTROS.find((item) => item.id === filtro)?.status ?? [];
    const termo = busca.trim().toLowerCase();
    const digitos = soDigitos(termo);
    return pedidos.filter((pedido) => (!status.length || status.includes(pedido.status))
      && (!termo || [pedido.numero, pedido.cliente.nome, pedido.email].some((campo) => campo.toLowerCase().includes(termo)) || (digitos.length >= 4 && [pedido.cliente.celular, pedido.cliente.cpf].some((campo) => soDigitos(campo).includes(digitos)))));
  }, [pedidos, filtro, busca]);
  // Customers by e-mail, the one with the latest order first (the list is newest first already).
  const clientes = useMemo(() => {
    const grupos = new Map<string, Pedido[]>();
    for (const pedido of lista) grupos.set(pedido.email, [...(grupos.get(pedido.email) ?? []), pedido]);
    return [...grupos.values()];
  }, [lista]);

  if (pedidos === null) return <section><h2 className="display text-6xl">Pedidos.</h2><p className="sans mt-8 max-w-2xl text-sm text-[var(--muted)]">Para ver os pedidos aqui, cadastre a variável <code>SUPABASE_SECRET_KEY</code> na Vercel.</p></section>;

  const contar = (status: StatusPedido[]) => pedidos.filter((pedido) => status.includes(pedido.status)).length;
  const recebido = pedidos.filter((pedido) => PAGOS.includes(pedido.status)).reduce((soma, pedido) => soma + Number(pedido.total), 0);
  const pecasPagas = pedidos.filter((pedido) => PAGOS.includes(pedido.status)).reduce((soma, pedido) => soma + pecasDo(pedido), 0);
  const chip = (ativo: boolean) => `sans press h-10 rounded-full px-4 text-[11px] uppercase tracking-[.12em] ${ativo ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"}`;

  return <section>
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Operação</p>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="display text-7xl">Pedidos.</h2>
      <span className="sans flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-[var(--muted)]"><Package size={15} /> {contar(["pago", "em_separacao"])} para despachar · {contar(["aguardando_pagamento"])} aguardando pagamento</span>
    </div>
    <p className="sans mt-4 text-sm text-[var(--muted)]">Cada pedido aparece aqui assim que o cliente termina a compra. Pagos até agora: <b className="text-[var(--ink)]">{formatPrice(recebido)}</b> · {pecasPagas} {pecasPagas === 1 ? "peça" : "peças"}. O cliente pode cancelar sozinho, com o dinheiro de volta, nas primeiras 24 horas e antes do envio; depois disso, use “Cancelar e estornar” aqui.</p>

    <div className="mt-6 flex flex-wrap gap-2">
      {FILTROS.map((item) => <button key={item.id} type="button" onClick={() => setFiltro(item.id)} className={chip(filtro === item.id)}>{item.nome}{item.status.length ? ` · ${contar(item.status)}` : ` · ${pedidos.length}`}</button>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-[var(--paper)] px-4 max-md:basis-full">
        <Search size={15} className="shrink-0 text-[var(--muted)]" />
        <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por pedido, nome, e-mail, celular ou CPF" className="sans min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </div>
      <div className="flex rounded-full bg-[var(--paper)] p-1">
        <button type="button" onClick={() => setPorCliente(false)} className={`sans h-9 rounded-full px-4 text-[11px] uppercase tracking-[.12em] ${porCliente ? "text-[var(--muted)]" : "bg-[var(--ink)] text-[var(--paper)]"}`}>Por pedido</button>
        <button type="button" onClick={() => setPorCliente(true)} className={`sans h-9 rounded-full px-4 text-[11px] uppercase tracking-[.12em] ${porCliente ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)]"}`}>Por cliente</button>
      </div>
      <button type="button" onClick={() => baixarCsv(lista)} disabled={!lista.length} className={`${botao} disabled:opacity-40`}><Download size={13} /> Planilha</button>
    </div>
    {lista.length === 0 ? <p className="sans mt-8 text-sm text-[var(--muted)]">{pedidos.length ? "Nenhum pedido com esse filtro." : "Nenhum pedido ainda."}</p>
      : <Quem.Provider value={quem}>{porCliente ? <div className="mt-5 space-y-3">{clientes.map((grupo) => <Cliente key={grupo[0].email} pedidos={grupo} />)}</div>
      : <div className="mt-5 space-y-2.5">{lista.map((pedido) => <Linha key={pedido.id} pedido={pedido} />)}</div>}</Quem.Provider>}
  </section>;
}
