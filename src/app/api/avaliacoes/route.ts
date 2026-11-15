import { NextResponse } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/products";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/publico";

// Reviews: anyone can send one; it shows up only after the team approves it in Supabase (status "aprovada").
const isRateLimited = createRateLimiter(5);

const novaSchema = z.object({
  produto: z.string().refine((id) => !!getProduct(id), "Produto não encontrado."),
  nome: z.string().trim().min(2, "Escreva seu nome.").max(40),
  nota: z.number().int().min(1, "Escolha uma nota.").max(5),
  texto: z.string().trim().min(10, "Conte um pouco mais (pelo menos 10 letras).").max(600),
  pedido: z.string().trim().max(40).optional(),
});

export async function GET(request: Request) {
  const produto = new URL(request.url).searchParams.get("produto") ?? "";
  if (!getProduct(produto)) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ avaliacoes: [] });
  const { data, error } = await supabase.from("avaliacoes").select("id, criada_em, nome, nota, texto").eq("produto_id", produto).order("criada_em", { ascending: false }).limit(50);
  if (error) {
    console.error("avaliacoes select failed:", error.message);
    return NextResponse.json({ avaliacoes: [] });
  }
  return NextResponse.json({ avaliacoes: data ?? [] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas avaliações seguidas. Tente de novo mais tarde." }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = novaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 500 });
  const { produto, nome, nota, texto, pedido } = parsed.data;
  const { error } = await supabase.rpc("enviar_avaliacao", { p_produto: produto, p_nome: nome, p_nota: nota, p_texto: texto, p_pedido: pedido ?? "" });
  if (error) {
    console.error("enviar_avaliacao failed:", error.message);
    return NextResponse.json({ error: "Não consegui enviar sua avaliação agora. Tente de novo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
