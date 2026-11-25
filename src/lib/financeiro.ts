import type { Pedido } from "@/lib/pedidos";
import type { StatusPedido } from "@/lib/pedido-status";
import { getPrecoCheio, getProductPrice, products } from "@/lib/products";

// The owners' money view (/admin). Unit costs and fees live in the table financeiro_config, the one-off expenses in
// despesas; the numbers start from the owners' plan for the first collection (2026-11-22).

export type ConfigFinanceira = {
  custo_camiseta: number;
  custo_acessorios: number;
  taxa_pix_fixa: number;
  taxa_cartao_percentual: number;
  taxa_cartao_fixa: number;
  capital_inicial: number;
  meta_pre_venda: number;
  meta_lancamento: number;
};

export const CONFIG_PADRAO: ConfigFinanceira = {
  custo_camiseta: 60,
  custo_acessorios: 4.34,
  taxa_pix_fixa: 1.99,
  taxa_cartao_percentual: 2.99,
  taxa_cartao_fixa: 0.49,
  capital_inicial: 4700,
  meta_pre_venda: 20,
  meta_lancamento: 60,
};

export const CATEGORIAS_DESPESA = { producao: "Produção", embalagem: "Embalagem", frete: "Frete", impostos: "Impostos e MEI", marketing: "Marketing", ferramentas: "Ferramentas e sites", outros: "Outros" } as const;
export type CategoriaDespesa = keyof typeof CATEGORIAS_DESPESA;
export type Despesa = { id: string; data: string; descricao: string; categoria: CategoriaDespesa; valor: number; criado_por: string | null };

// The owners' plan for the first collection (image "Planejamento Financeiro – 1ª Coleção", 2026-11-22), worked out
// from the current prices and targets: pre-sale tees at the owners' price (/admin "Preços", R$ 160 on 2026-11-24),
// the rest at the crossed-out one (R$ 180),
// each costing production + accessories, plus the shipping boxes (R$ 805) and one month of MEI (R$ 92).
export const DESPESAS_PLANO = 805 + 92;

// The open sale starts on 1 December (owners: pre-sale the week of 23/11, official launch on 1/12). Orders made before
// it count for the pre-sale target: with one price for both, the date is what tells them apart.
export const ABERTURA_VENDA = new Date("2026-12-01T00:00:00-03:00");

export function planoDaColecao(config: ConfigFinanceira) {
  const custoUnidade = config.custo_camiseta + config.custo_acessorios;
  // The first tee's prices stand for the collection (the owners set one price for all of them so far).
  const precoPreVenda = getProductPrice(products[0]);
  const precoLancamento = getPrecoCheio(products[0]) ?? precoPreVenda;
  const preVenda = { camisetas: config.meta_pre_venda, preco: precoPreVenda, receita: config.meta_pre_venda * precoPreVenda };
  const lancamento = { camisetas: config.meta_lancamento, preco: precoLancamento, receita: config.meta_lancamento * precoLancamento };
  const faturamento = preVenda.receita + lancamento.receita;
  const custos = (preVenda.camisetas + lancamento.camisetas) * custoUnidade + DESPESAS_PLANO;
  const lucro = faturamento - custos;
  return {
    preVenda: { ...preVenda, lucro: centavos(preVenda.receita - preVenda.camisetas * custoUnidade) },
    lancamento,
    faturamento: centavos(faturamento),
    custos: centavos(custos),
    lucro: centavos(lucro),
    caixaFinal: centavos(config.capital_inicial + lucro),
  };
}

// Orders that brought money in.
export const STATUS_PAGOS: StatusPedido[] = ["pago", "em_separacao", "enviado", "entregue"];

const centavos = (valor: number) => Math.round(valor * 100) / 100;

// What a paid order cost in provider fees. Orders closed on WhatsApp were paid outside the site (Pix straight to the
// account): no fee is counted for them.
export function taxaDoPedido(pedido: Pedido, config: ConfigFinanceira) {
  if (pedido.metodo === "whatsapp" || !pedido.pagamento?.provedor) return 0;
  const cartao = pedido.metodo === "cartao" || pedido.pagamento?.metodo === "cartao";
  return centavos(cartao ? Number(pedido.total) * config.taxa_cartao_percentual / 100 + config.taxa_cartao_fixa : config.taxa_pix_fixa);
}

export function resumoFinanceiro(pedidos: Pedido[], config: ConfigFinanceira, despesas: Despesa[]) {
  const pagos = pedidos.filter((pedido) => STATUS_PAGOS.includes(pedido.status));
  let camisetas = 0;
  let camisetasPreVenda = 0;
  let receitaPecas = 0;
  let freteCobrado = 0;
  let taxas = 0;
  for (const pedido of pagos) {
    const daPreVenda = new Date(pedido.criado_em) < ABERTURA_VENDA;
    for (const item of pedido.itens) {
      camisetas += item.quantidade;
      if (daPreVenda) camisetasPreVenda += item.quantidade;
    }
    // What the pieces brought in: subtotal minus coupon and Pix discounts. Shipping is passed on to the carrier.
    receitaPecas += Number(pedido.subtotal) - Number(pedido.desconto_cupom) - Number(pedido.desconto_pix);
    freteCobrado += Number(pedido.frete?.preco ?? 0);
    taxas += taxaDoPedido(pedido, config);
  }
  const custoProducao = camisetas * config.custo_camiseta;
  const custoAcessorios = camisetas * config.custo_acessorios;
  const despesasTotal = despesas.reduce((total, despesa) => total + Number(despesa.valor), 0);
  const custoTotal = custoProducao + custoAcessorios + taxas + despesasTotal;
  const lucro = receitaPecas - custoTotal;
  const porStatus = Object.fromEntries(["aguardando_pagamento", ...STATUS_PAGOS, "cancelado"].map((status) => [status, pedidos.filter((pedido) => pedido.status === status).length])) as Record<StatusPedido, number>;
  const aReceber = pedidos.filter((pedido) => pedido.status === "aguardando_pagamento").reduce((total, pedido) => total + Number(pedido.total), 0);
  return {
    pedidosPagos: pagos.length,
    camisetas,
    camisetasPreVenda,
    camisetasLancamento: camisetas - camisetasPreVenda,
    receitaPecas: centavos(receitaPecas),
    freteCobrado: centavos(freteCobrado),
    custoProducao: centavos(custoProducao),
    custoAcessorios: centavos(custoAcessorios),
    taxas: centavos(taxas),
    despesasTotal: centavos(despesasTotal),
    custoTotal: centavos(custoTotal),
    lucro: centavos(lucro),
    caixa: centavos(config.capital_inicial + lucro),
    margem: receitaPecas > 0 ? lucro / receitaPecas : 0,
    ticketMedio: pagos.length ? centavos(receitaPecas / pagos.length) : 0,
    lucroPorCamiseta: camisetas ? centavos(lucro / camisetas) : 0,
    aReceber: centavos(aReceber),
    porStatus,
  };
}

export type ResumoFinanceiro = ReturnType<typeof resumoFinanceiro>;
