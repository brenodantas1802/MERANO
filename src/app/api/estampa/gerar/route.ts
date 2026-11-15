import { NextResponse } from "next/server";
import { z } from "zod";
import { estampaCasaDe, planEstampa } from "@/lib/estampa";
import { fichaSchema, painelSchema, referenciasSchema } from "@/lib/estampa-schema";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

// Same image model as the try-on. 1K is a screen preview: the print file is prepared from it afterwards.
const IMAGE_MODEL = "openai/gpt-image-2.5-flare";
const RESOLUTION = "1K";
// The expensive call: few per client, and a per-instance daily safety net (in memory, not a hard quota).
const isRateLimited = createRateLimiter(4);
const DAILY_LIMIT = 60;
let daily = { day: "", count: 0 };

function isOverDailyLimit() {
  const today = new Date().toISOString().slice(0, 10);
  if (daily.day !== today) daily = { day: today, count: 0 };
  if (daily.count >= DAILY_LIMIT) return true;
  daily.count += 1;
  return false;
}

const gerarSchema = z.object({ painel: painelSchema, ficha: fichaSchema, referencias: referenciasSchema });

// House prints live in /public; the image API can't reach localhost, so they go up as data URLs.
async function loadPublicImage(origin: string, path: string) {
  const response = await fetch(new URL(path, origin));
  if (!response.ok) throw new Error(`Não foi possível carregar a estampa da casa (${path}).`);
  const type = response.headers.get("content-type")?.split(";")[0] || "image/webp";
  return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
}

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json({ error: "Limite de criações atingido. Aguarde alguns minutos e tente novamente." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }
  const parsed = gerarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY não configurada no servidor." }, { status: 500 });

  const { painel, ficha, referencias } = parsed.data;
  if (!ficha.ideia && !ficha.elementos.length) {
    return NextResponse.json({ error: "Conte a sua ideia no chat antes de criar a estampa." }, { status: 400 });
  }
  if (isOverDailyLimit()) {
    return NextResponse.json({ error: "A criação de estampas atingiu o limite de hoje. Tente novamente amanhã." }, { status: 429 });
  }

  try {
    const casa = painel.estampaCasa ? estampaCasaDe(painel.estampaCasa) : undefined;
    const refs = ficha.usarReferencias ? referencias : [];
    // The prompt is rebuilt here from the confirmed ficha, the same function the customer saw it from.
    const prompt = planEstampa(ficha, painel, { referencias: refs.length, estampaCasa: !!casa });
    const images = [...(casa ? [await loadPublicImage(new URL(request.url).origin, casa.src)] : []), ...refs];

    const response = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-OpenRouter-Title": "Personalizador MERANNO" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        ...(images.length ? { input_references: images.map((url) => ({ type: "image_url", image_url: { url } })) } : {}),
        n: 1,
        aspect_ratio: "3:4",
        resolution: RESOLUTION,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || `OpenRouter respondeu com HTTP ${response.status}.` }, { status: response.status });
    }
    const image = data?.data?.[0];
    if (!image?.b64_json) return NextResponse.json({ error: "A API não devolveu uma imagem." }, { status: 502 });
    return NextResponse.json({ imagem: `data:${image.media_type || "image/png"};base64,${image.b64_json}`, prompt, cost: Number(data?.usage?.cost || 0), model: IMAGE_MODEL });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado." }, { status: 500 });
  }
}
