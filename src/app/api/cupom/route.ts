import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createSecretClient } from "@/lib/supabase/publico";

// The 10% first-purchase coupon: stores the e-mail (with the visitor's consent) and answers with the welcome code
// (the active coupon marked boas_vindas in /admin), shown right away in the pop-up.
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
  // Through the server with the secret key: the function is closed to the publishable key.
  const admin = createSecretClient();
  if (!admin) return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 500 });
  const { error } = await admin.rpc("registrar_email_cupom", { p_email: parsed.data.email, p_consentimento: true });
  if (error) {
    console.error("registrar_email_cupom failed:", error.message);
    return NextResponse.json({ error: "Não consegui guardar seu e-mail agora. Tente de novo." }, { status: 502 });
  }
  const { data: cupom } = await admin.from("cupons").select("codigo, percentual").eq("boas_vindas", true).eq("ativo", true).maybeSingle();
  if (cupom) await admin.from("cadastros_cupom").update({ cupom_enviado: true }).eq("email", parsed.data.email.trim().toLowerCase());
  return NextResponse.json({ ok: true, codigo: cupom?.codigo ?? null, percentual: cupom?.percentual ?? null });
}
