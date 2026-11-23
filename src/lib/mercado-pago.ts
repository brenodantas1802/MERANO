import type { Pedido } from "@/lib/pedidos";

// Mercado Pago Checkout Pro: the customer pays on Mercado Pago's own page (Pix or card), so card data never touches
// this site. Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro
//   MERCADOPAGO_ACCESS_TOKEN   Production access token (Suas integrações → Credenciais de produção). Server only.
// Used only while Asaas isn't connected (see lib/pagamento). Without either, orders go through WhatsApp.

const API = "https://api.mercadopago.com";

export const mercadoPagoConfigurado = () => Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

const cabecalhos = (extra: Record<string, string> = {}) => ({ Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`, "Content-Type": "application/json", ...extra });

// Creates the payment for an order and returns the link to Mercado Pago's page. Pix orders only offer Pix; card orders
// offer credit card in up to 3 instalments.
export async function criarPreferencia(pedido: Pedido, origem: string) {
  const publico = !/localhost|127\.0\.0\.1/.test(origem);
  const volta = `${origem}/pedido/${pedido.id}`;
  const [nome, ...sobrenome] = pedido.cliente.nome.split(/\s+/);
  const corpo = {
    items: [{ id: pedido.numero, title: `Meranno · pedido ${pedido.numero}`, description: pedido.itens.map((item) => `${item.quantidade}x ${item.nome} ${item.tamanho}`).join(", ").slice(0, 250), quantity: 1, currency_id: "BRL", unit_price: pedido.total }],
    payer: { name: nome, surname: sobrenome.join(" "), email: pedido.email, identification: { type: "CPF", number: pedido.cliente.cpf } },
    external_reference: pedido.id,
    statement_descriptor: "MERANNO",
    back_urls: { success: volta, pending: volta, failure: volta },
    ...(publico ? { auto_return: "approved", notification_url: `${origem}/api/pagamento/webhook` } : {}),
    payment_methods: pedido.metodo === "pix"
      ? { excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }, { id: "atm" }, { id: "prepaid_card" }], installments: 1 }
      : { excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }, { id: "atm" }, { id: "debit_card" }, { id: "prepaid_card" }], installments: 3 },
    // The order keeps its price for two days; after that the customer starts again from the cart.
    expires: true,
    expiration_date_to: new Date(Date.now() + 2 * 86400_000).toISOString(),
  };
  const resposta = await fetch(`${API}/checkout/preferences`, { method: "POST", headers: cabecalhos({ "X-Idempotency-Key": crypto.randomUUID() }), body: JSON.stringify(corpo), signal: AbortSignal.timeout(10000), cache: "no-store" });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok || typeof dados.init_point !== "string") throw new Error(`Mercado Pago ${resposta.status}: ${String(dados.message ?? "").slice(0, 160)}`);
  return { link: dados.init_point as string, preferencia: String(dados.id) };
}

export type PagamentoMP = { id: string; status: string; pedidoId: string; valor: number; metodo: string };

// Reads a payment straight from Mercado Pago: notifications only say "something changed", never trusted as is.
export async function lerPagamento(id: string): Promise<PagamentoMP | null> {
  if (!/^\d{1,20}$/.test(id)) return null;
  const resposta = await fetch(`${API}/v1/payments/${id}`, { headers: cabecalhos(), signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!resposta.ok) return null;
  const dados = await resposta.json();
  return { id: String(dados.id), status: String(dados.status), pedidoId: String(dados.external_reference ?? ""), valor: Number(dados.transaction_amount ?? 0), metodo: String(dados.payment_method_id ?? dados.payment_type_id ?? "") };
}
