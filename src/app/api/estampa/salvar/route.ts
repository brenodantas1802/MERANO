import { NextResponse } from "next/server";
import { z } from "zod";
import { planEstampa, estampaCasaDe } from "@/lib/estampa";
import { fichaSchema, painelSchema } from "@/lib/estampa-schema";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/publico";

// Saves a finished creation (its art plus everything the customer chose) when it goes into the cart.
const isRateLimited = createRateLimiter(10);
const MAX_ARTE_CHARS = 4_200_000; // about 3 MB of image

const salvarSchema = z.object({
  painel: painelSchema,
  ficha: fichaSchema,
  tamanho: z.enum(["PP", "P", "M", "G", "GG"]),
  referencias: z.number().int().min(0).max(3),
  // Name for the "Criado por você" card, stored with the ficha.
  assinatura: z.string().trim().max(24).optional(),
  arte: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/, "Arte inválida.").max(MAX_ARTE_CHARS, "Arte grande demais."),
});

const EXTENSAO = { png: "png", jpeg: "jpg", webp: "webp" } as const;

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = salvarSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });

  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 500 });

  const { painel, ficha, tamanho, referencias, arte, assinatura } = parsed.data;
  const tipo = arte.slice(11, arte.indexOf(";")) as keyof typeof EXTENSAO;
  const caminho = `${crypto.randomUUID()}.${EXTENSAO[tipo]}`;
  const prompt = planEstampa(ficha, painel, { referencias: ficha.usarReferencias ? referencias : 0, estampaCasa: !!(painel.estampaCasa && estampaCasaDe(painel.estampaCasa)) });

  const arquivo = Buffer.from(arte.slice(arte.indexOf(",") + 1), "base64");
  const envio = await supabase.storage.from("estampas").upload(caminho, arquivo, { contentType: `image/${tipo}`, upsert: false });
  if (envio.error) {
    console.error("Estampa upload failed:", envio.error.message);
    return NextResponse.json({ error: "Não consegui guardar a arte agora. Tente de novo." }, { status: 502 });
  }

  const { data: id, error } = await supabase.rpc("registrar_criacao", { p_painel: painel, p_ficha: assinatura ? { ...ficha, assinatura } : ficha, p_prompt: prompt, p_arte_path: caminho, p_tamanho: tamanho });
  if (error || typeof id !== "string") {
    console.error("registrar_criacao failed:", error?.message);
    return NextResponse.json({ error: "Não consegui registrar a criação agora. Tente de novo." }, { status: 502 });
  }
  return NextResponse.json({ id });
}
