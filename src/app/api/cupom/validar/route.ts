import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createSecretClient } from "@/lib/supabase/publico";
import { validarCupom } from "@/lib/pedidos";

// "Aplicar" on the payment page. The order route checks the coupon again when the order is placed.
const isRateLimited = createRateLimiter(30);
const schema = z.object({ codigo: z.string().max(40), email: z.string().max(160).optional() });

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Digite o código do cupom." }, { status: 400 });
  const admin = createSecretClient();
  if (!admin) return NextResponse.json({ error: "Não deu para conferir o cupom agora." }, { status: 503 });
  const email = parsed.data.email && z.email().safeParse(parsed.data.email).success ? parsed.data.email : undefined;
  const resultado = await validarCupom(admin, parsed.data.codigo, email);
  if ("erro" in resultado) return NextResponse.json({ error: resultado.erro }, { status: 404 });
  return NextResponse.json(resultado.cupom);
}
