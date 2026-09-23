import { NextResponse } from "next/server";
import { z } from "zod";

const IMAGE_MODEL = "openai/gpt-image-2.5-flare";
const POSE_MODEL = "openai/gpt-5-mini";
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
  personPhoto: z.string().min(1, "Adicione a sua foto antes de gerar."),
  shirtFront: z.string().min(1, "Escolha uma camisa antes de gerar."),
  shirtBack: z.string().min(1, "Escolha uma camisa antes de gerar."),
  aspectRatio: z.string().optional(),
  resolution: z.string().optional(),
});

type Pose = "frente" | "lado" | "costas";

// Picks which garment reference to use by detecting the person's orientation in their photo,
// since the print position only matches the pose when front/back photos get front/back references.
async function detectPose(personPhotoUrl: string): Promise<Pose> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: POSE_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Observe esta foto de uma pessoa. Responda com exatamente uma palavra, sem pontuação: "frente" se o rosto estiver visível e a pessoa estiver de frente para a câmera, "costas" se a pessoa estiver de costas (rosto não visível, vendo as costas dela), ou "lado" se estiver de perfil. Responda apenas a palavra.',
              },
              { type: "image_url", image_url: { url: personPhotoUrl } },
            ],
          },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });
    const data = await response.json();
    const raw = String(data?.choices?.[0]?.message?.content ?? "").trim().toLowerCase();
    if (raw.includes("costas")) return "costas";
    if (raw.includes("lado") || raw.includes("perfil")) return "lado";
    return "frente";
  } catch {
    return "frente";
  }
}

const PRESERVE_PERSON_PROMPT = `EDITAR A FOTO DA PESSOA, não criar uma pessoa nova. A foto da pessoa é a imagem-base e deve ser preservada: mantenha exatamente a mesma pessoa, rosto, identidade, expressão, tom de pele, cabelo, pose, mãos, proporções corporais, enquadramento, câmera, iluminação e fundo. Faça somente uma troca virtual de roupa sobre a pessoa. Use a imagem 2 exclusivamente como referência exata da roupa. Não substitua a pessoa, não mude a pose e não faça uma nova sessão de fotos.

Vista a pessoa da imagem 1 com a roupa da imagem 2, mantendo fielmente modelo, corte, caimento, comprimento, gola, mangas, costuras, textura, material, cores, etiquetas e todos os detalhes visuais. Não invente logotipos, textos, estampas ou detalhes que não estejam na imagem 2.

Resultado: uma edição fotográfica realista da imagem 1, com a roupa trocada e todo o restante praticamente idêntico. Preserve a anatomia e evite mãos extras, membros deformados, rosto alterado, pessoa diferente, roupa genérica, estampa inventada ou fundo modificado.`;

function orientationInstruction(pose: Pose) {
  if (pose === "costas") return `\n\nA pessoa na imagem 1 está de costas. A imagem 2 mostra o verso da peça: reproduza fielmente a estampa traseira na posição, escala e cores corretas. Gere a pessoa de costas, vestindo essa vista da peça, sem mostrar a frente.`;
  if (pose === "lado") return `\n\nA pessoa na imagem 1 está de lado/perfil. A imagem 2 mostra a peça de frente: adapte-a naturalmente ao ângulo de perfil da pessoa, mantendo a perspectiva e o enquadramento originais.`;
  return `\n\nA pessoa na imagem 1 está de frente. A imagem 2 mostra a peça de frente: vista a pessoa de frente com essa vista da peça, sem mostrar as costas.`;
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

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY não configurada no servidor." }, { status: 500 });
  }

  const { personPhoto, shirtFront, shirtBack, aspectRatio, resolution } = parsed.data;

  try {
    const pose = await detectPose(personPhoto);
    const shirtImage = pose === "costas" ? shirtBack : shirtFront;
    const prompt = PRESERVE_PERSON_PROMPT + orientationInstruction(pose);

    const response = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-OpenRouter-Title": "Provador MERANO",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        input_references: [personPhoto, shirtImage].map((url) => ({ type: "image_url", image_url: { url } })),
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
      model: IMAGE_MODEL,
      pose,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro inesperado." }, { status: 500 });
  }
}
