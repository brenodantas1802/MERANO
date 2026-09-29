import { NextResponse } from "next/server";
import { z } from "zod";
import { detectPose, POSE_LABELS, type Pose } from "@/lib/pose";
import { getProduct } from "@/lib/products";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { planTryOn, type ViewKey } from "@/lib/tryon";

const IMAGE_MODEL = "openai/gpt-image-2.5-flare";
const isRateLimited = createRateLimiter(5);
const DAILY_LIMIT = 100;
const MAX_PHOTO_CHARS = 8_000_000;
let daily = { day: "", count: 0 };

// In-memory, so per server instance: a safety net against runaway API spend, not a hard quota.
function isOverDailyLimit() {
  const today = new Date().toISOString().slice(0, 10);
  if (daily.day !== today) daily = { day: today, count: 0 };
  if (daily.count >= DAILY_LIMIT) return true;
  daily.count += 1;
  return false;
}

const generateSchema = z.object({
  personPhoto: z.string("Adicione a sua foto antes de gerar.").min(1, "Adicione a sua foto antes de gerar.").startsWith("data:image/", "Foto inválida. Envie uma imagem.").max(MAX_PHOTO_CHARS, "Foto muito grande. Tente uma imagem menor."),
  productId: z.string("Escolha uma camisa antes de gerar.").min(1, "Escolha uma camisa antes de gerar."),
  // Set when the photo has several people: a crop of the chosen one (for pose detection) and where they are.
  target: z
    .object({
      crop: z.string().startsWith("data:image/", "Recorte inválido."),
      box: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), w: z.number().min(0).max(1), h: z.number().min(0).max(1) }),
      total: z.number().int().min(2).max(10),
      order: z.number().int().min(1).max(10).optional(),
      candidates: z.number().int().min(1).max(10).optional(),
    })
    .optional(),
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

  const { personPhoto, productId, target, aspectRatio, resolution } = parsed.data;
  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Camisa não encontrada." }, { status: 404 });
  }
  if (isOverDailyLimit()) {
    return NextResponse.json({ error: "O provador atingiu o limite de uso de hoje. Tente novamente amanhã." }, { status: 429 });
  }

  try {
    const origin = new URL(request.url).origin;
    const availableViews = (Object.keys(product.views) as ViewKey[]).filter((key) => product.views[key]);
    // The garment shots load while the pose is being detected, so picking the right ones costs no extra wait.
    const garmentImages = Promise.all(availableViews.map(async (key) => [key, await loadGarmentImage(origin, product.views[key]!)] as const));
    garmentImages.catch(() => undefined); // awaited below; this only keeps an early return from leaving it unhandled

    let detection;
    try {
      detection = await detectPose(target?.crop ?? personPhoto, apiKey);
    } catch (error) {
      console.error("Pose detection failed:", error);
      return NextResponse.json({ error: "Não conseguimos identificar a pose da sua foto agora. Tente novamente em instantes." }, { status: 502 });
    }
    if (!detection.personVisible) {
      return NextResponse.json({ error: "Não encontramos uma pessoa nessa foto. Envie uma foto sua com o tronco à mostra, de frente, de lado ou de costas." }, { status: 422 });
    }

    const { pose } = detection;
    const plan = planTryOn(product.views, pose, target && { box: target.box, total: target.total, order: target.order, candidates: target.candidates, withCrop: true });
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
        input_references: [personPhoto, ...plan.views.map((key) => garments.get(key)!), ...(target ? [target.crop] : [])].map((url) => ({ type: "image_url", image_url: { url } })),
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
