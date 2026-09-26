import { NextResponse } from "next/server";
import { z } from "zod";
import { detectPose, POSE_LABELS, type Pose } from "@/lib/pose";
import { getProduct } from "@/lib/products";
import { planTryOn, type ViewKey } from "@/lib/tryon";

const IMAGE_MODEL = "openai/gpt-image-2.5-flare";
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
  personPhoto: z.string("Adicione a sua foto antes de gerar.").min(1, "Adicione a sua foto antes de gerar.").startsWith("data:image/", "Foto inválida. Envie uma imagem."),
  productId: z.string("Escolha uma camisa antes de gerar.").min(1, "Escolha uma camisa antes de gerar."),
  aspectRatio: z.string().optional(),
  resolution: z.string().optional(),
});

function shownSide(pose: Pose) {
  if (pose.startsWith("frente")) return "a frente da peça";
  if (pose.startsWith("costas")) return "as costas da peça";
  return pose.endsWith("_esq") ? "a lateral esquerda da peça" : "a lateral direita da peça";
}

// The garment shots live in /public; the image API can't reach them on localhost, so they go up as data URLs.
async function loadGarmentImage(origin: string, path: string) {
  const response = await fetch(new URL(path, origin));
  if (!response.ok) throw new Error(`Não foi possível carregar a imagem da camiseta (${path}).`);
  const type = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
}

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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY não configurada no servidor." }, { status: 500 });
  }

  const { personPhoto, productId, aspectRatio, resolution } = parsed.data;
  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Camisa não encontrada." }, { status: 404 });
  }

  try {
    const origin = new URL(request.url).origin;
    const availableViews = (Object.keys(product.views) as ViewKey[]).filter((key) => product.views[key]);
    // The garment shots load while the pose is being detected, so picking the right ones costs no extra wait.
    const garmentImages = Promise.all(availableViews.map(async (key) => [key, await loadGarmentImage(origin, product.views[key]!)] as const));
    garmentImages.catch(() => undefined); // awaited below; this only keeps an early return from leaving it unhandled

    let detection;
    try {
      detection = await detectPose(personPhoto, apiKey);
    } catch (error) {
      console.error("Pose detection failed:", error);
      return NextResponse.json({ error: "Não conseguimos identificar a pose da sua foto agora. Tente novamente em instantes." }, { status: 502 });
    }
    if (!detection.personVisible) {
      return NextResponse.json({ error: "Não encontramos uma pessoa nessa foto. Envie uma foto sua com o tronco à mostra, de frente, de lado ou de costas." }, { status: 422 });
    }

    const { pose } = detection;
    const plan = planTryOn(product.views, pose);
    const garments = new Map(await garmentImages);

    const response = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-OpenRouter-Title": "Provador MERANO",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: plan.prompt,
        input_references: [personPhoto, ...plan.views.map((key) => garments.get(key)!)].map((url) => ({ type: "image_url", image_url: { url } })),
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
      cost: Number(data?.usage?.cost || 0) + detection.cost,
      usage: data?.usage || {},
      model: IMAGE_MODEL,
      pose,
      poseLabel: POSE_LABELS[pose],
      shown: shownSide(pose),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado." }, { status: 500 });
  }
}
