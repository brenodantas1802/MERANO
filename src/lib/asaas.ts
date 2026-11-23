import type { Pedido } from "@/lib/pedidos";

// Asaas Checkout: the customer pays on Asaas's own page (Pix, or credit card in up to 3 instalments), so card data
// never touches this site. Docs: https://docs.asaas.com/docs/checkout-asaas
//   ASAAS_API_KEY         API key (Asaas → Integrações → Chaves de API). Server only. A sandbox key ($aact_hmlg_…)
//                         talks to the sandbox by itself; a production key ($aact_prod_…) to production.
//   ASAAS_WEBHOOK_TOKEN   optional but recommended; the "Token de autenticação" typed when creating the webhook in Asaas.
//                         When set, notifications without it are refused.
// The payment itself is always read back from Asaas with the API key, so a forged notification can't mark an order paid.

const SANDBOX = "https://api-sandbox.asaas.com/v3";
const PRODUCAO = "https://api.asaas.com/v3";

// Asaas keys start with "$", which .env files read as a variable: accept the key with or without it.
const chave = () => {
  const valor = (process.env.ASAAS_API_KEY ?? "").trim();
  return valor && !valor.startsWith("$") && valor.startsWith("aact_") ? `$${valor}` : valor;
};

export const asaasConfigurado = () => chave().length > 20;

const base = () => process.env.ASAAS_URL || (chave().includes("_hmlg_") ? SANDBOX : PRODUCAO);

const cabecalhos = () => ({ access_token: chave(), "Content-Type": "application/json", "User-Agent": "MerannoSite/1.0" });

async function chamar(caminho: string, init: { method?: string; body?: unknown } = {}) {
  const resposta = await fetch(`${base()}${caminho}`, {
    method: init.method ?? "GET",
    headers: cabecalhos(),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const motivo = Array.isArray(dados?.errors) ? dados.errors.map((erro: { description?: string }) => erro.description).join("; ") : "";
    throw Object.assign(new Error(`Asaas ${resposta.status}: ${motivo.slice(0, 200)}`), { status: resposta.status });
  }
  return dados;
}

// A small picture of the tee: the checkout API lists a picture for each item.
const MINIATURA = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCABeAGADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAAQCAwUBBgf/xAAzEAABBAEBBQcCBAcAAAAAAAABAAIDBBEhBRIxMmETIkFRUnGhBjMUI4HBJEJiY5Gx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/APraEIJABJOAOJXFpxzmtaXOIAHiUpLtBjdI27x8zwSE1x1raPY5wwMJaPbGvyjgquOy2JZnAveQAeA0CBeljGDK4Y9WqiRlcLTnPlwwqOz7SlbCXmchvmNErsSa01ktqWR7jO8Foec4YOCtfWZLgPaXAcA46K8cMKK0IrrH6P7pTQIIyDlYpOAmalncDGuOjvjXCJjRQhCiBIbSnPdrMOr9X9AnZZGxROkdwaMlYrXOke+eTmdr7KrCVSTtPqGQeiHH65WhIMOWVsU9pte5L7D5WtMEioBSAUGu1VoGioghDtFS+Od7gYrAjbjgWB2Sgsk0aVxoLgxnqjwPfKoeyw14LrAc3xb2YHyrXnc/DO/qIUGvTn7aEb3MNCmFmRP7CwD/ACu4rTByMojM2nPvyNrNOg7z/wBh/wB0SxO5A49FfNRljc55d2m8SS7CXt9yq/2KLGX9NZdJakPjJhbcw7qyfp1uKzz6nkrWn0akCrD3im2DISTTh3uU9HyoKZDxUYDnKJtAVGpqCVRGwcY912yP4SN3pk/ZRtnDm+WVZI3eono4FQX88TXJ6pLvxYPELPqnej3U5VjeHbwGB5oU4k79AWq72RkMeRgZ4JxCiPN7JqyU4TBKBvscQcHPinbBw1cZrZmP9x3+1GydFVKNP5oHVaTeRZkWsw6LTbyIFbB4+yjR1aUWDoT0XNn8hQcu8B0TNVjp4CxoySAqLgywpnZLs/4QOVqLYe847zvLwCaQhGQhCFBiwHL5D5yOPyVC0dCpV9WE+ZJVds4BVaUVdZSVpjkKzKWr1pj7ZQI2tGFd2d9s+6hcOGFWbP5FRZZGWkKWyTh+OqJwubPGLPQ6qJW0hCFECEIQYVU/lBVXDhpTNeu6MbjiCQfBQuVXOYSC1VorR4rTP20lUi3NCtEQlzNCMoMi6fBMUMdkFy7UdkHLcKyjHutDT4IJznARUGLLT4O4K2aDu5BH6opxgPAVRpoQhZR//9k=";

// The customer's details, so the checkout page comes filled in. Asaas wants the city as its IBGE code (from ViaCEP).
async function dadosDoCliente(pedido: Pedido) {
  const ibge = await fetch(`https://viacep.com.br/ws/${pedido.endereco.cep}/json/`, { signal: AbortSignal.timeout(4000), cache: "no-store" })
    .then((resposta) => resposta.json())
    .then((dados) => Number(dados?.ibge) || undefined)
    .catch(() => undefined);
  return {
    name: pedido.cliente.nome,
    cpfCnpj: pedido.cliente.cpf,
    email: pedido.email,
    phone: pedido.cliente.celular,
    postalCode: pedido.endereco.cep,
    address: pedido.endereco.rua,
    addressNumber: pedido.endereco.numero,
    complement: pedido.endereco.complemento || undefined,
    province: pedido.endereco.bairro,
    ...(ibge ? { city: ibge } : {}),
  };
}

// Creates the checkout for an order and returns the link to Asaas's page. The order is one line with its total (pieces,
// shipping and discounts already worked out on the server). Pix orders only offer Pix (they carry the 5% discount);
// card orders offer credit card, paid at once or in up to 3 instalments.
export async function criarCheckout(pedido: Pedido, origem: string) {
  const volta = `${origem}/pedido/${pedido.id}`;
  const pix = pedido.metodo === "pix";
  const corpo = {
    billingTypes: pix ? ["PIX"] : ["CREDIT_CARD"],
    chargeTypes: pix ? ["DETACHED"] : ["DETACHED", "INSTALLMENT"],
    ...(pix ? {} : { installment: { maxInstallmentCount: 3 } }),
    // A day to pay; after that "Pagar agora" on the order's page opens a new one.
    minutesToExpire: 1440,
    externalReference: pedido.id,
    callback: { successUrl: volta, cancelUrl: volta, expiredUrl: volta },
    items: [{
      name: `Meranno · ${pedido.numero}`.slice(0, 30),
      description: pedido.itens.map((item) => `${item.quantidade}x ${item.nome} ${item.tamanho}`).join(", ").slice(0, 150),
      quantity: 1,
      value: Number(pedido.total),
      imageBase64: MINIATURA,
    }],
  };
  let dados;
  try {
    dados = await chamar("/checkouts", { method: "POST", body: { ...corpo, customerData: await dadosDoCliente(pedido) } });
  } catch (erro) {
    // A detail Asaas doesn't accept (an address it can't read, say): the customer types them on Asaas's page instead.
    if ((erro as { status?: number }).status !== 400) throw erro;
    console.error("Asaas refused the customer data, trying without it:", erro instanceof Error ? erro.message : erro);
    dados = await chamar("/checkouts", { method: "POST", body: corpo });
  }
  const id = String(dados.id ?? "");
  if (!id) throw new Error("Asaas: checkout sem id");
  return { link: typeof dados.link === "string" && dados.link ? dados.link : `https://${base() === SANDBOX ? "sandbox." : ""}asaas.com/checkoutSession/show?id=${id}`, checkout: id };
}

export type CobrancaAsaas = { id: string; status: string; value: number; billingType: string; checkoutSession: string | null; externalReference: string | null };

const cobranca = (dados: Record<string, unknown>): CobrancaAsaas => ({
  id: String(dados.id),
  status: String(dados.status ?? ""),
  value: Number(dados.value ?? 0),
  billingType: String(dados.billingType ?? ""),
  checkoutSession: dados.checkoutSession ? String(dados.checkoutSession) : null,
  externalReference: dados.externalReference ? String(dados.externalReference) : null,
});

// Paid, money on its way or already in the account.
export const PAGO_ASAAS = new Set(["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"]);

export async function lerCobranca(id: string): Promise<CobrancaAsaas | null> {
  if (!/^pay_[A-Za-z0-9]{4,40}$/.test(id)) return null;
  return cobranca(await chamar(`/payments/${id}`));
}

// The charges a checkout produced (one, or one per instalment).
export async function cobrancasDoCheckout(checkout: string): Promise<CobrancaAsaas[]> {
  if (!/^[0-9a-f-]{36}$/i.test(checkout)) return [];
  const dados = await chamar(`/payments?checkoutSession=${encodeURIComponent(checkout)}&limit=100`);
  return Array.isArray(dados?.data) ? dados.data.map(cobranca) : [];
}

// What a checkout's charges add up to, for the order: paid only when the full amount is covered. A card paid in
// instalments makes one charge per instalment, all confirmed together.
export function resumoDoCheckout(cobrancas: CobrancaAsaas[], total: number) {
  const pagas = cobrancas.filter((item) => PAGO_ASAAS.has(item.status));
  const soma = (lista: CobrancaAsaas[]) => Math.round(lista.reduce((total, item) => total + item.value, 0) * 100) / 100;
  const cobre = (valor: number) => Math.abs(valor - total) <= 0.05;
  const cartaoParcelado = pagas.some((item) => item.billingType === "CREDIT_CARD") && cobre(soma(cobrancas));
  const principal = pagas[0] ?? cobrancas[0];
  return {
    pago: pagas.length > 0 && (cobre(soma(pagas)) || cartaoParcelado),
    valor: cartaoParcelado ? soma(cobrancas) : soma(pagas),
    id: principal?.id ?? "",
    status: principal?.status ?? "",
    metodo: principal?.billingType === "CREDIT_CARD" ? "cartao" : principal?.billingType === "PIX" ? "pix" : (principal?.billingType ?? "").toLowerCase(),
  };
}
