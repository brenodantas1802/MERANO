import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { createSecretClient } from "@/lib/supabase/publico";
import { precoPersonalizada } from "@/lib/products";
import { usarPrecos } from "@/lib/precos-servidor";
import { TAMANHOS_PERSONALIZADA } from "@/lib/pedidos";

// "Comprar esta peça" in the Personalizador, step 2: records the creation (choices, size and where each production
// file is) once its files are in Storage. The order later picks it up by id at the catalogue's custom-tee price.
const isRateLimited = createRateLimiter(12);
const arquivo = (tipo: "png" | "jpg") => z.string().regex(new RegExp(`^[0-9a-f-]{36}\.${tipo}$`), "Arquivo inválido.");
const hexCor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const texto = (max: number) => z.string().trim().max(max);

const registroSchema = z.object({
  arte: z.string().regex(/^[0-9a-f-]{36}\.png$/, "Arte inválida."),
  arquivos: z.object({ mockupFrente: arquivo("jpg"), mockupCostas: arquivo("jpg"), marca: arquivo("png").optional() }),
  tamanho: z.enum(TAMANHOS_PERSONALIZADA),
  prompt: texto(6000).default(""),
  painel: z.object({
    fit: z.enum(["regular", "oversized", "boxy"]),
    fitName: texto(30),
    fabric: hexCor,
    fabricName: texto(40),
    paleta: z.array(hexCor).min(1).max(6),
    fonte: texto(30),
    marca: z.boolean(),
    posicao: z.enum(["back", "front", "both"]),
    colecao: texto(100).optional(),
  }),
  producao: z.object({
    id: texto(20),
    arteCm: z.object({ largura: z.number().positive().max(36), altura: z.number().positive().max(45.01) }),
    artePx: z.object({ largura: z.number().int().positive().max(20000), altura: z.number().int().positive().max(20000) }),
    arteOriginal: z.boolean(),
    marcaCm: z.number().positive().max(36).nullable(),
    layout: z.object({ offsetXCM: z.number(), offsetYCM: z.number() }).partial().nullable(),
  }),
});

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  const corpo = registroSchema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ error: corpo.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  const admin = createSecretClient();
  if (!admin) return NextResponse.json({ error: "A compra do Personalizador não está disponível agora." }, { status: 503 });

  const { arte, arquivos, tamanho, prompt, painel, producao } = corpo.data;
  const ideia = painel.colecao || prompt.slice(0, 280);
  // painel.modelagem / paleta / fonte keep the panel's older fields working; fitName / fabricName name the order line.
  const { data: id, error } = await admin.rpc("registrar_criacao", {
    p_painel: { ...painel, modelagem: painel.fitName },
    p_ficha: { ideia, arquivos, producao },
    p_prompt: prompt,
    p_arte_path: arte,
    p_tamanho: tamanho,
  });
  if (error || typeof id !== "string") {
    console.error("registrar_criacao failed:", error?.message);
    return NextResponse.json({ error: error?.message?.includes("arte não encontrada") ? "A arte não chegou. Tente de novo." : "Não consegui registrar a peça agora. Tente de novo." }, { status: 502 });
  }
  await usarPrecos();
  return NextResponse.json({ id, preco: precoPersonalizada() });
}
