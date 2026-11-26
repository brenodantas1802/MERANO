import { bloqueioPersonalizador } from "@/lib/personalizador-lancamento";
import { checkContent, ContentProblem } from "@/lib/personalizador/worker/content-policy.js";
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
  arquivos: z.object({ mockupFrente: arquivo("jpg"), mockupCostas: arquivo("jpg"), marca: arquivo("png").optional(), arteFrente: arquivo("png").optional() }),
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
    tipoMarca: z.enum(["wordmark","logo"]).default("wordmark"),
    posicao: z.enum(["back", "front", "both"]),
    colecao: texto(100).optional(),
  }),
  producao: z.object({
    id: texto(20),
    arteCm: z.object({ largura: z.number().positive().max(36), altura: z.number().positive().max(45.01) }),
    artePx: z.object({ largura: z.number().int().positive().max(20000), altura: z.number().int().positive().max(20000) }),
    arteOriginal: z.boolean(),
    marcaCm: z.number().positive().max(36).nullable(),
    layouts: z.object({ front: z.object({widthCM:z.number().min(1).max(36),heightCM:z.number().positive().max(45.01),offsetXCM:z.number().min(-18).max(18),offsetYCM:z.number().min(0).max(45)}).optional(),back:z.object({widthCM:z.number().min(1).max(36),heightCM:z.number().positive().max(45.01),offsetXCM:z.number().min(-18).max(18),offsetYCM:z.number().min(0).max(45)}).optional(),brand:z.object({widthCM:z.number().min(1).max(36),heightCM:z.number().positive().max(45.01).optional(),offsetXCM:z.number().min(-18).max(18),offsetYCM:z.number().min(0).max(45)}).optional() }).optional(),
    layout: z.object({ offsetXCM: z.number(), offsetYCM: z.number() }).partial().nullable(),
  }),
});

export async function POST(request: Request) {
  const bloqueio = bloqueioPersonalizador();
  if (bloqueio) return bloqueio;
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Muitas tentativas seguidas. Aguarde alguns minutos." }, { status: 429 });
  const corpo = registroSchema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ error: corpo.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  const admin = createSecretClient();
  if (!admin) return NextResponse.json({ error: "A compra do Personalizador não está disponível agora." }, { status: 503 });

  const { arte, arquivos, tamanho, prompt, painel, producao } = corpo.data;
  if(painel.posicao==="both"&&!arquivos.arteFrente)return NextResponse.json({error:"Envie o arquivo de estampa da frente também."},{status:400});
  if(painel.marca&&!arquivos.marca)return NextResponse.json({error:"Envie o arquivo da marca frontal."},{status:400});
  const ideia = painel.colecao || prompt.slice(0, 280);
  const key=process.env.PERSONALIZADOR_OPENROUTER_API_KEY||process.env.OPENROUTER_API_KEY;
  if(!key)return NextResponse.json({error:"A verificação de conteúdo está indisponível. Tente novamente mais tarde."},{status:503});
  try {
    // Inspect actual uploaded files, not a browser-supplied approval flag or a substitute thumbnail.
    for(const caminho of [arte,arquivos.arteFrente,arquivos.marca].filter((value):value is string=>!!value)){
      const {data,error}=await admin.storage.from("estampas").download(caminho);
      if(error||!data)return NextResponse.json({error:"Não foi possível conferir a arte enviada."},{status:422});
      if(data.size>12_000_000)return NextResponse.json({error:"Envie uma arte de até 12 MB para a verificação de conteúdo."},{status:422});
      const image="data:image/png;base64,"+Buffer.from(await data.arrayBuffer()).toString("base64");
      await checkContent({text:prompt+(caminho===arquivos.marca?" Marca própria MERANNO.":""),images:[image],artworkOnly:true},key);
    }
  } catch(error) {
    return NextResponse.json({error:error instanceof ContentProblem?error.message:"Não foi possível verificar o conteúdo. A peça não foi liberada."},{status:error instanceof ContentProblem?error.status:503});
  }
  // painel.modelagem / paleta / fonte keep the panel's older fields working; fitName / fabricName name the order line.
  const { data: id, error } = await admin.rpc("registrar_criacao", {
    p_painel: { ...painel, modelagem: painel.fitName },
    p_ficha: { ideia, arquivos, producao, revisao: { automatica: "aprovada", humana: "pendente", politica:"meranno-v1", verificadaEm:new Date().toISOString() } },
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
