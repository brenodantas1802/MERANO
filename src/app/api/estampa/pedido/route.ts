import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/publico";

// Called at payment: the custom pieces in the order move from "no carrinho" to "pedida", with who ordered them.
const isRateLimited = createRateLimiter(10);
const texto = (max: number) => z.string().trim().max(max);

const pedidoSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(10),
  pedido: texto(40).min(1),
  cliente: z.object({ nome: texto(120), email: texto(160), celular: texto(30), cep: texto(12), cidade: texto(80) }),
});

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas seguidas." }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = pedidoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });

  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 500 });
  const { ids, pedido, cliente } = parsed.data;
  const { data, error } = await supabase.rpc("marcar_criacoes_pedidas", { p_ids: ids, p_pedido: pedido, p_cliente: cliente });
  if (error) {
    console.error("marcar_criacoes_pedidas failed:", error.message);
    return NextResponse.json({ error: "Não consegui registrar o pedido das peças personalizadas." }, { status: 502 });
  }
  return NextResponse.json({ marcadas: data });
}
