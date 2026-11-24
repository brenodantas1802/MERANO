// Shipping quotes from SuperFrete (cheaper Correios/Jadlog/Loggi labels). Docs: https://superfrete.readme.io/reference
//   SUPERFRETE_TOKEN     token from web.superfrete.com → Integrações → Desenvolvedores (server only)
//   FRETE_CEP_ORIGEM     CEP the parcels leave from
//   SUPERFRETE_URL       optional; https://sandbox.superfrete.com to test with a sandbox token
//   SUPERFRETE_CONTATO   optional; e-mail for SuperFrete's technical contact, which their docs make mandatory in the
//                        User-Agent. Defaults to the shop's public contact address.

export type OpcaoFrete = { id: number; nome: string; empresa: string; preco: number; prazoMin: number; prazoMax: number };

// One folded tee in its box, in kg and cm. The Remix regular tee (180 g/m²) weighs about 160 g in M; with the box,
// tissue and tag the parcel is about 0.3 kg. The box size is a guess: replace it with the real one once measured
// (the carrier charges by the real weight or by the box volume, whichever is higher).
export const PACOTE_CAMISETA = { weight: 0.3, height: 5, width: 20, length: 28 };

// PAC and SEDEX (Correios) and Jadlog (3), which only shows up when one of its drop-off points is near the origin.
// No Mini Envios (17) since 2026-11-24: it takes parcels of up to 300 g, 24 x 16 x 4 cm and R$ 100 declared, and one
// R$ 180 tee is over that, so the label couldn't be bought after the customer picked the cheapest option.
const SERVICOS = "1,2,3";

type RespostaSuperFrete = { id: number; name: string; price?: number; delivery_range?: { min: number; max: number }; delivery_time?: number; company?: { name: string }; has_error?: boolean; error?: string };

export const freteConfigurado = () => Boolean(process.env.SUPERFRETE_TOKEN && process.env.FRETE_CEP_ORIGEM);

export async function cotarFrete(cep: string, pecas: number): Promise<OpcaoFrete[]> {
  const base = process.env.SUPERFRETE_URL ?? "https://api.superfrete.com";
  const contato = process.env.SUPERFRETE_CONTATO || "contato.meranno@gmail.com";
  const response = await fetch(`${base}/api/v0/calculator`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPERFRETE_TOKEN}`,
      "User-Agent": `Meranno Site 1.0 (${contato})`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { postal_code: process.env.FRETE_CEP_ORIGEM!.replace(/\D/g, "") },
      to: { postal_code: cep },
      services: SERVICOS,
      options: { own_hand: false, receipt: false, insurance_value: 0, use_insurance_value: false },
      products: [{ quantity: pecas, ...PACOTE_CAMISETA }],
    }),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`SuperFrete ${response.status}`);
  const data = (await response.json()) as RespostaSuperFrete[];
  return data
    .filter((opcao) => !opcao.has_error && !opcao.error && typeof opcao.price === "number")
    .map((opcao) => ({
      id: opcao.id,
      nome: opcao.name,
      empresa: opcao.company?.name ?? "",
      preco: opcao.price!,
      prazoMin: opcao.delivery_range?.min ?? opcao.delivery_time ?? 0,
      prazoMax: opcao.delivery_range?.max ?? opcao.delivery_time ?? 0,
    }))
    .sort((a, b) => a.preco - b.preco);
}

// Shown while SuperFrete isn't connected yet (no token), always labelled "valores de exemplo" on the page.
export function freteExemplo(pecas: number): OpcaoFrete[] {
  const extra = (pecas - 1) * 2.5;
  return [
    { id: 1, nome: "PAC", empresa: "Correios", preco: 18.4 + extra, prazoMin: 5, prazoMax: 8 },
    { id: 2, nome: "SEDEX", empresa: "Correios", preco: 29.9 + extra, prazoMin: 1, prazoMax: 3 },
  ];
}
