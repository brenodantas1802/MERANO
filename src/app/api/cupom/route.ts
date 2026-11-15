import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/publico";

// The 10% first-purchase coupon: stores the e-mail (with the visitor's consent) so the team can send the coupon.
const isRateLimited = createRateLimiter(5);
const cupomSchema = z.object({
  email: z.email("E-mail inválido.").max(160),
  consentimento: z.literal(true, "Marque a caixa para receber o cupom."),
});

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas. Tente de novo em alguns minutos." }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = cupomSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 500 });
  const { error } = await supabase.rpc("registrar_email_cupom", { p_email: parsed.data.email, p_consentimento: true });
  if (error) {
    console.error("registrar_email_cupom failed:", error.message);
    return NextResponse.json({ error: "Não consegui guardar seu e-mail agora. Tente de novo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
