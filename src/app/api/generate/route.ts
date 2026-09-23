import { NextResponse } from "next/server";
import { z } from "zod";

const MODEL = "openai/gpt-image-2.5-flare";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

const generateSchema = z.object({
  prompt: z.string().trim().min(1, "Escreva um prompt antes de gerar."),
  references: z.array(z.string()).min(1, "Envie até duas imagens por vista.").max(2, "Envie até duas imagens por vista."),
  aspectRatio: z.string().optional(),
  resolution: z.string().optional(),
});

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json({ error: "Limite de gerações atingido. Aguarde alguns minutos e tente novamente." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY não configurada no servidor." }, { status: 500 });
  }

  const { prompt, references, aspectRatio, resolution } = parsed.data;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-OpenRouter-Title": "Provador MERANO",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        input_references: references.map((url) => ({ type: "image_url", image_url: { url } })),
        n: 1,
        aspect_ratio: aspectRatio || "3:4",
        resolution: resolution || "1K",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || `OpenRouter respondeu com HTTP ${response.status}.` }, { status: response.status });
    }
    const image = data?.data?.[0];
    if (!image?.b64_json) {
      return NextResponse.json({ error: "A API não devolveu uma imagem." }, { status: 502 });
    }
    return NextResponse.json({
      image: `data:${image.media_type || "image/png"};base64,${image.b64_json}`,
      cost: Number(data?.usage?.cost || 0),
      usage: data?.usage || {},
      model: MODEL,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado." }, { status: 500 });
  }
}
