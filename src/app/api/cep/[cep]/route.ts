import { NextResponse, type NextRequest } from "next/server";

// The address of a CEP, for the payment page: the customer types the CEP and then only the number and the complement
// (owners, 2026-11-26). Asked from the server, with a second source when the first fails or doesn't know the CEP: from
// the browser, ViaCEP alone sometimes failed for a customer and the fields stayed empty.
type Endereco = { rua: string; bairro: string; cidade: string; uf: string };

// The address; null when the source says the CEP doesn't exist; undefined when the source couldn't be reached.
async function buscar(url: string, ler: (dados: Record<string, unknown>) => Endereco | null): Promise<Endereco | null | undefined> {
  try {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(4000), headers: { accept: "application/json" }, next: { revalidate: 86_400 } });
    if (resposta.status === 404 || resposta.status === 400) return null;
    if (!resposta.ok) return undefined;
    return ler(await resposta.json());
  } catch {
    return undefined;
  }
}

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

export async function GET(_request: NextRequest, ctx: { params: Promise<{ cep: string }> }) {
  const { cep } = await ctx.params;
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) return NextResponse.json({ error: "CEP inválido." }, { status: 400 });

  const viaCep = await buscar(`https://viacep.com.br/ws/${digitos}/json/`, (dados) => dados.erro ? null : { rua: texto(dados.logradouro), bairro: texto(dados.bairro), cidade: texto(dados.localidade), uf: texto(dados.uf) });
  const endereco = viaCep?.cidade ? viaCep : await buscar(`https://brasilapi.com.br/api/cep/v1/${digitos}`, (dados) => dados.city ? { rua: texto(dados.street), bairro: texto(dados.neighborhood), cidade: texto(dados.city), uf: texto(dados.state) } : null);

  // Both sources answered that it doesn't exist: 404. One of them out of reach: 502, so the page asks to type it.
  if (!endereco?.cidade) return NextResponse.json({ error: "Não achamos esse CEP." }, { status: viaCep === null && endereco === null ? 404 : 502 });
  return NextResponse.json(endereco, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
