import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createSecretClient } from "@/lib/supabase/publico";

// "Comprar esta peça" in the Personalizador, step 1: one-time upload links for the production files (300 DPI art,
// mockups, chest mark). The browser sends the files straight to Supabase Storage, because the art can be far bigger
// than what a request to the site may carry. Names are random and chosen here.
const isRateLimited = createRateLimiter(12);
const pedidoSchema = z.object({ tipos: z.array(z.enum(["png", "jpg"])).min(1).max(5) });

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  const corpo = pedidoSchema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  const admin = createSecretClient();
  if (!admin) return NextResponse.json({ error: "A compra do Personalizador não está disponível agora." }, { status: 503 });

  const envios = [];
  for (const tipo of corpo.data.tipos) {
    const caminho = `${crypto.randomUUID()}.${tipo}`;
    const { data, error } = await admin.storage.from("estampas").createSignedUploadUrl(caminho);
    if (error || !data) {
      console.error("createSignedUploadUrl failed:", error?.message);
      return NextResponse.json({ error: "Não consegui preparar o envio da arte. Tente de novo." }, { status: 502 });
    }
    envios.push({ caminho, url: data.signedUrl });
  }
  return NextResponse.json({ envios });
}
