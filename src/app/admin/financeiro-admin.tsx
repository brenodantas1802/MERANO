"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { CATEGORIAS_DESPESA, planoDaColecao, type ConfigFinanceira, type Despesa, type ResumoFinanceiro } from "@/lib/financeiro";
import { formatPrice } from "@/lib/products";
import { adicionarDespesa, removerDespesa, salvarConfig } from "./financeiro-acoes";

// The money: what came in, what went out, what's left, and how far the collection is from the owners' plan.
const pct = (valor: number) => `${Math.round(valor * 100)}%`;
const reais = (valor: number) => formatPrice(valor);
const numeroCampo = (valor: number) => String(valor).replace(".", ",");
const campo = "sans mt-1.5 block h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--campo)] px-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--vinho)]";
const rotulo = "sans block text-[12px] text-[var(--muted)]";

function Indicador({ titulo, valor, nota, destaque }: { titulo: string; valor: string; nota?: string; destaque?: "bom" | "ruim" }) {
  return <div className="min-w-0 rounded-[20px] border border-[var(--line)] bg-[var(--cartao)] p-4 sm:p-5">
    <p className="sans text-[11px] uppercase tracking-[.16em] text-[var(--muted)]">{titulo}</p>
    <p className={`display mt-2 break-words text-[26px] leading-tight tabular-nums sm:text-4xl ${destaque === "ruim" ? "text-[var(--perda)]" : destaque === "bom" ? "text-[var(--ganho)]" : ""}`}>{valor}</p>
    {nota && <p className="sans mt-1 text-[12px] text-[var(--muted)]">{nota}</p>}
  </div>;
}

// A meter against a target: the bar fills up to 100%, the numbers say the rest.
function Meta({ titulo, atual, meta, detalhe }: { titulo: string; atual: number; meta: number; detalhe: string }) {
  const parte = meta > 0 ? Math.min(1, atual / meta) : 0;
  return <div>
    <div className="sans flex items-baseline justify-between gap-3 text-sm"><span>{titulo}</span><span className="tabular-nums text-[var(--muted)]"><b className="text-[var(--ink)]">{atual}</b> de {meta}</span></div>
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--trilho)]" role="meter" aria-valuemin={0} aria-valuemax={meta} aria-valuenow={atual} aria-label={titulo}>
      <div className="h-full rounded-full bg-[var(--vinho)] transition-[width] duration-700" style={{ width: `${parte * 100}%` }} />
    </div>
    <p className="sans mt-1.5 text-[12px] text-[var(--muted)]">{detalhe}</p>
  </div>;
}

// Where the money went, largest first: one bar per kind of cost, all in the same colour.
function Custos({ resumo }: { resumo: ResumoFinanceiro }) {
  const linhas = [
    ["Produção das camisetas", resumo.custoProducao, `${resumo.camisetas} camisetas`],
    ["Acessórios (tags, etiquetas)", resumo.custoAcessorios, `${resumo.camisetas} camisetas`],
    ["Taxas de pagamento", resumo.taxas, "Pix e cartão on-line"],
    ["Despesas lançadas", resumo.despesasTotal, "caixas, MEI e outras"],
  ] as const;
  const maior = Math.max(1, ...linhas.map(([, valor]) => valor));
  return <ul className="space-y-4">
    {[...linhas].sort((a, b) => b[1] - a[1]).map(([nome, valor, nota]) => <li key={nome} title={`${nome}: ${reais(valor)} (${nota})`}>
      <div className="sans flex items-baseline justify-between gap-3 text-sm"><span>{nome}</span><span className="tabular-nums">{reais(valor)}</span></div>
      <div className="mt-1.5 h-2 rounded-full bg-[var(--trilho)]"><div className="h-full rounded-full bg-[var(--vinho)]" style={{ width: `${(valor / maior) * 100}%`, minWidth: valor > 0 ? 4 : 0 }} /></div>
      <p className="sans mt-1 text-[11px] text-[var(--muted)]">{nota}</p>
    </li>)}
  </ul>;
}

function Despesas({ despesas }: { despesas: Despesa[] }) {
  const [resposta, lancar, salvando] = useActionState(adicionarDespesa, null);
  const [removendo, startTransition] = useTransition();
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  return <div>
    <form action={lancar} className="grid gap-3 sm:grid-cols-[1fr_170px_130px_150px_auto] sm:items-end">
      <label className={rotulo}>O que foi<input name="descricao" required maxLength={120} placeholder="Ex.: anúncio no Instagram" className={campo} /></label>
      <label className={rotulo}>Tipo<select name="categoria" defaultValue="outros" className={campo}>{Object.entries(CATEGORIAS_DESPESA).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></label>
      <label className={rotulo}>Valor (R$)<input name="valor" required inputMode="decimal" placeholder="0,00" className={campo} /></label>
      <label className={rotulo}>Data<input name="data" type="date" required defaultValue={hoje} className={campo} /></label>
      <button type="submit" disabled={salvando} className="press sans h-11 rounded-full bg-[var(--vinho)] px-5 text-[11px] uppercase tracking-[.14em] text-[var(--creme)] disabled:opacity-60">{salvando ? "Salvando…" : "Lançar"}</button>
    </form>
    {resposta && <p role={resposta.tipo === "erro" ? "alert" : "status"} className={`sans mt-2 text-[13px] ${resposta.tipo === "erro" ? "text-[var(--perda)]" : "text-[var(--ganho)]"}`}>{resposta.texto}</p>}
    {despesas.length === 0 ? <p className="sans mt-6 text-sm text-[var(--muted)]">Nenhuma despesa lançada.</p>
      : <ul className={`sans mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm ${removendo ? "opacity-60" : ""}`}>
        {despesas.map((despesa) => <li key={despesa.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0"><p className="truncate">{despesa.descricao}</p><p className="text-[12px] text-[var(--muted)]">{CATEGORIAS_DESPESA[despesa.categoria] ?? despesa.categoria} · {new Date(`${despesa.data}T12:00:00`).toLocaleDateString("pt-BR")}{despesa.criado_por === "planejamento" ? " · do planejamento" : ""}</p></div>
          <div className="flex items-center gap-2"><span className="tabular-nums">{reais(Number(despesa.valor))}</span>
            <button type="button" aria-label={`Apagar a despesa ${despesa.descricao}`} onClick={() => { if (window.confirm(`Apagar "${despesa.descricao}"?`)) startTransition(() => removerDespesa(despesa.id)); }} className="press flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--realce)] hover:text-[var(--ink)]"><Trash2 size={16} /></button>
          </div>
        </li>)}
      </ul>}
  </div>;
}

function AjustarCustos({ config }: { config: ConfigFinanceira }) {
  const [resposta, salvar, salvando] = useActionState(salvarConfig, null);
  const campos: [keyof ConfigFinanceira, string, string][] = [
    ["custo_camiseta", "Produção por camiseta (R$)", "camiseta + estampa"],
    ["custo_acessorios", "Acessórios por camiseta (R$)", "tags, etiquetas"],
    ["taxa_pix_fixa", "Taxa por Pix (R$)", "Asaas: R$ 1,99"],
    ["taxa_cartao_percentual", "Taxa do cartão (%)", "Asaas: 2,99%"],
    ["taxa_cartao_fixa", "Taxa fixa do cartão (R$)", "Asaas: R$ 0,49"],
    ["capital_inicial", "Capital inicial (R$)", "caixa + aporte dos sócios"],
    ["meta_pre_venda", "Meta da pré-venda (camisetas)", ""],
    ["meta_lancamento", "Meta do lançamento (camisetas)", ""],
  ];
  return <form action={salvar} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {campos.map(([nome, titulo, dica]) => <label key={nome} className={rotulo}>{titulo}<input name={nome} required inputMode="decimal" defaultValue={numeroCampo(config[nome])} className={campo} />{dica && <span className="mt-1 block text-[11px]">{dica}</span>}</label>)}
    <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
      <button type="submit" disabled={salvando} className="press sans h-11 rounded-full bg-[var(--vinho)] px-6 text-[11px] uppercase tracking-[.14em] text-[var(--creme)] disabled:opacity-60">{salvando ? "Salvando…" : "Salvar custos"}</button>
      {resposta && <p role={resposta.tipo === "erro" ? "alert" : "status"} className={`sans text-[13px] ${resposta.tipo === "erro" ? "text-[var(--perda)]" : "text-[var(--ganho)]"}`}>{resposta.texto}</p>}
      <p className="sans text-[12px] text-[var(--muted)]">As taxas do Asaas são as da tabela pública; confiram as do contrato de vocês na conta do Asaas.</p>
    </div>
  </form>;
}

export function FinanceiroAdmin({ resumo, config, despesas, disponivel }: { resumo: ResumoFinanceiro; config: ConfigFinanceira; despesas: Despesa[]; disponivel: boolean }) {
  const [ajustando, setAjustando] = useState(false);
  const plano = planoDaColecao(config);
  const vendidas = resumo.camisetas;
  const linhasPlano: [string, string, string][] = [
    ["Pré-venda", `${resumo.camisetasPreVenda} de ${plano.preVenda.camisetas} camisetas`, `${reais(plano.preVenda.receita)} previstos (${plano.preVenda.camisetas} × ${reais(plano.preVenda.preco)})`],
    ["Lançamento", `${resumo.camisetasLancamento} de ${plano.lancamento.camisetas} camisetas`, `${reais(plano.lancamento.receita)} previstos (${plano.lancamento.camisetas} × ${reais(plano.lancamento.preco)})`],
    ["Faturamento", reais(resumo.receitaPecas), `de ${reais(plano.faturamento)} previstos`],
    ["Lucro", reais(resumo.lucro), `de ${reais(plano.lucro)} previstos`],
    ["Caixa", reais(resumo.caixa), `de ${reais(plano.caixaFinal)} previstos no fim da coleção`],
  ];

  return <section id="financeiro" className="mb-24 scroll-mt-28">
    <p className="sans mb-4 text-[11px] uppercase tracking-[.2em] text-[var(--muted)]">Financeiro</p>
    <h2 className="display text-6xl">Resumo da coleção.</h2>
    {!disponivel && <p className="sans mt-4 max-w-2xl text-sm text-[var(--perda)]">Sem a chave secreta do Supabase (<code>SUPABASE_SECRET_KEY</code>) o painel não lê os pedidos: os números abaixo ficam zerados.</p>}
    <p className="sans mt-4 max-w-2xl text-sm text-[var(--muted)]">Conta só os pedidos pagos. O frete cobrado ({reais(resumo.freteCobrado)}) vai inteiro para os Correios e fica de fora do faturamento e dos custos.</p>

    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Indicador titulo="Faturamento" valor={reais(resumo.receitaPecas)} nota={`${resumo.pedidosPagos} ${resumo.pedidosPagos === 1 ? "pedido pago" : "pedidos pagos"} · ${vendidas} ${vendidas === 1 ? "camiseta" : "camisetas"}`} />
      <Indicador titulo="Custos" valor={reais(resumo.custoTotal)} nota="produção, acessórios, taxas e despesas" />
      <Indicador titulo="Lucro" valor={reais(resumo.lucro)} nota={resumo.receitaPecas > 0 ? `margem de ${pct(resumo.margem)} · ${reais(resumo.lucroPorCamiseta)} por camiseta` : "ainda sem vendas pagas"} destaque={resumo.lucro < 0 ? "ruim" : resumo.lucro > 0 ? "bom" : undefined} />
      <Indicador titulo="Caixa estimado" valor={reais(resumo.caixa)} nota={`capital de ${reais(config.capital_inicial)} + lucro`} />
    </div>

    <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Indicador titulo="A receber" valor={reais(resumo.aReceber)} nota={`${resumo.porStatus.aguardando_pagamento} aguardando pagamento`} />
      <Indicador titulo="Para despachar" valor={String(resumo.porStatus.pago + resumo.porStatus.em_separacao)} nota="pagos e em separação" />
      <Indicador titulo="Enviados" valor={String(resumo.porStatus.enviado)} nota="a caminho" />
      <Indicador titulo="Entregues" valor={String(resumo.porStatus.entregue)} nota={`ticket médio de ${reais(resumo.ticketMedio)}`} />
    </div>

    <div className="mt-10 grid gap-10 lg:grid-cols-2">
      <div className="rounded-[24px] border border-[var(--line)] bg-[var(--cartao)] p-6 md:p-8">
        <h3 className="display text-3xl">Metas da coleção</h3>
        <div className="mt-6 space-y-6">
          <Meta titulo="Pré-venda" atual={resumo.camisetasPreVenda} meta={config.meta_pre_venda} detalhe={`a ${reais(plano.preVenda.preco)} cada`} />
          <Meta titulo="Lançamento" atual={resumo.camisetasLancamento} meta={config.meta_lancamento} detalhe={`a ${reais(plano.lancamento.preco)} cada`} />
        </div>
        <table className="sans mt-8 w-full text-left text-sm">
          <caption className="sr-only">Planejado e realizado</caption>
          <tbody className="divide-y divide-[var(--line)]">{linhasPlano.map(([nome, real, previsto]) => <tr key={nome}><th scope="row" className="py-2.5 pr-3 font-normal text-[var(--muted)]">{nome}</th><td className="py-2.5 pr-3 tabular-nums">{real}</td><td className="py-2.5 text-[12px] text-[var(--muted)]">{previsto}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="rounded-[24px] border border-[var(--line)] bg-[var(--cartao)] p-6 md:p-8">
        <h3 className="display text-3xl">Para onde foi o dinheiro</h3>
        <div className="mt-6"><Custos resumo={resumo} /></div>
      </div>
    </div>

    <div className="mt-10 rounded-[24px] border border-[var(--line)] bg-[var(--cartao)] p-6 md:p-8">
      <h3 className="display text-3xl">Despesas</h3>
      <p className="sans mt-2 text-sm text-[var(--muted)]">Gastos que não são por camiseta: caixas, MEI, anúncios, ferramentas. Entram nos custos.</p>
      <div className="mt-6"><Despesas despesas={despesas} /></div>
    </div>

    <div className="mt-10">
      <button type="button" onClick={() => setAjustando((aberto) => !aberto)} aria-expanded={ajustando} className="press sans rounded-full border border-[var(--line)] px-5 py-3 text-[11px] uppercase tracking-[.14em] hover:bg-[var(--realce)]">{ajustando ? "Fechar" : "Ajustar custos, taxas e metas"}</button>
      {ajustando && <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-[var(--cartao)] p-6 md:p-8"><AjustarCustos config={config} /></div>}
    </div>
  </section>;
}
