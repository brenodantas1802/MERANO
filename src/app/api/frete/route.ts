import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { cotarFrete, freteConfigurado, freteExemplo } from "@/lib/frete";

// Shipping quote for the cart and the payment page. The SuperFrete token stays on the server.
const isRateLimited = createRateLimiter(40);
const freteSchema = z.object({
  cep: z.string().transform((cep) => cep.replace(/\D/g, "")).pipe(z.string().length(8, "CEP inválido.")),
  pecas: z.number().int().min(1).max(20),
});

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas consultas. Tente de novo em alguns minutos." }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = freteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  const { cep, pecas } = parsed.data;

  // Until the SuperFrete token is set, example values (marked as such), like the demo payment around them.
  if (!freteConfigurado()) return NextResponse.json({ opcoes: freteExemplo(pecas), exemplo: true });
  try {
    const opcoes = await cotarFrete(cep, pecas);
    if (!opcoes.length) return NextResponse.json({ error: "Nenhuma transportadora atende esse CEP." }, { status: 404 });
    return NextResponse.json({ opcoes });
  } catch (error) {
    console.error("SuperFrete quote failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Não deu para calcular o frete agora. Tente de novo." }, { status: 502 });
  }
}
