import { z } from "zod";

// Orientation of the person's chest relative to the camera. "esq"/"dir" are always the left/right of
// the IMAGE (as seen by whoever looks at the photo), which is unambiguous for a vision model.
export const POSES = [
  "frente",
  "frente_diagonal_esq",
  "frente_diagonal_dir",
  "perfil_esq",
  "perfil_dir",
  "costas_diagonal_esq",
  "costas_diagonal_dir",
  "costas",
] as const;

export type Pose = (typeof POSES)[number];

export const POSE_LABELS: Record<Pose, string> = {
  frente: "De frente",
  frente_diagonal_esq: "De frente, girada para a esquerda",
  frente_diagonal_dir: "De frente, girada para a direita",
  perfil_esq: "De lado (90°), voltada para a esquerda",
  perfil_dir: "De lado (90°), voltada para a direita",
  costas_diagonal_esq: "De costas, girada para a esquerda",
  costas_diagonal_dir: "De costas, girada para a direita",
  costas: "De costas",
};

export type PoseDetection = {
  pose: Pose;
  confidence: "alta" | "media" | "baixa";
  personVisible: boolean;
  model: string;
  cost: number;
};

// Tried in order per call: if a model errors out or answers something unparseable, the next one takes over.
const POSE_MODELS = ["google/gemini-2.5-flash", "openai/gpt-5.4-mini"];

const POSE_PROMPT = `Você é o classificador de orientação de um provador virtual de camisetas. Analise a foto e escolha a PESSOA PRINCIPAL (a maior e mais central; ignore pessoas ao fundo).

Descubra para onde o PEITO/TRONCO dessa pessoa aponta em relação à câmera e escolha uma orientação:
- "frente": tronco voltado para a câmera (giro de até ~25°). Vê-se o peito da roupa de frente.
- "frente_diagonal_esq" ou "frente_diagonal_dir": corpo girado ~25° a 65°. O peito ainda aparece, mas aponta para a ESQUERDA ou para a DIREITA da imagem; vê-se a frente e uma lateral do corpo.
- "perfil_esq" ou "perfil_dir": corpo girado ~65° a 115°, visto de lado (90°). Um ombro fica na frente e o outro escondido; o peito aponta para a ESQUERDA ou para a DIREITA da imagem.
- "costas_diagonal_esq" ou "costas_diagonal_dir": corpo de costas girado ~115° a 155°. Vê-se sobretudo as costas e um pouco de uma lateral; a pessoa está virada/andando para a ESQUERDA ou para a DIREITA da imagem.
- "costas": de costas para a câmera (giro acima de ~155°). Vê-se a parte de trás da cabeça e as costas da roupa; o rosto não aparece.

Regras:
- "esq" e "dir" são SEMPRE a esquerda e a direita DA IMAGEM (de quem olha a foto), nunca a esquerda/direita da pessoa.
- Classifique pelo TRONCO, que é onde a camiseta será vestida, e não pela cabeça: uma pessoa de costas com a cabeça virada continua "costas"; uma pessoa de frente olhando de lado continua "frente".
- Rosto voltado para a câmera com peito visível = frente. Só cabelo/nuca sem rosto = costas.
- Se não houver nenhuma pessoa (ou nenhum tronco) visível, use pessoa_visivel = false e orientacao = "frente".`;

const poseSchema = {
  type: "object",
  properties: {
    observacao: { type: "string", description: "Uma frase curta: quem é a pessoa principal e para onde o peito dela aponta." },
    pessoa_visivel: { type: "boolean" },
    orientacao: { type: "string", enum: [...POSES] },
    confianca: { type: "string", enum: ["alta", "media", "baixa"] },
  },
  required: ["observacao", "pessoa_visivel", "orientacao", "confianca"],
  additionalProperties: false,
};

const poseAnswer = z.object({
  pessoa_visivel: z.boolean(),
  orientacao: z.enum(POSES),
  confianca: z.enum(["alta", "media", "baixa"]).catch("media"),
});

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Resposta sem JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

async function classify(photoUrl: string, model: string, apiKey: string): Promise<PoseDetection> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: POSE_PROMPT },
            { type: "image_url", image_url: { url: photoUrl } },
          ],
        },
      ],
      response_format: { type: "json_schema", json_schema: { name: "pose", strict: true, schema: poseSchema } },
      // Reasoning models spend the token budget on thinking first; keep it small but leave room for the answer.
      reasoning: { effort: "low" },
      max_tokens: 1500,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`Resposta vazia (finish_reason: ${data?.choices?.[0]?.finish_reason ?? "?"}).`);
  }
  const answer = poseAnswer.parse(extractJson(content));
  return { pose: answer.orientacao, confidence: answer.confianca, personVisible: answer.pessoa_visivel, model, cost: Number(data?.usage?.cost || 0) };
}

// Throws instead of guessing: silently defaulting to "frente" is what used to hide a detector that never answered.
async function classifyWithFallback(photoUrl: string, apiKey: string): Promise<PoseDetection> {
  const failures: string[] = [];
  for (const model of POSE_MODELS) {
    try {
      return await classify(photoUrl, model, apiKey);
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`Não foi possível identificar a pose da foto (${failures.join(" | ")}).`);
}

const ANGLES = ["frente", "frente_diagonal", "perfil", "costas_diagonal", "costas"] as const;
type Angle = (typeof ANGLES)[number];
type Side = "esq" | "dir" | null;

function splitPose(pose: Pose): { angle: Angle; side: Side } {
  const side: Side = pose.endsWith("_esq") ? "esq" : pose.endsWith("_dir") ? "dir" : null;
  return { angle: (side ? pose.slice(0, -4) : pose) as Angle, side };
}

// Turn angle and turn direction are voted separately, so a single flipped left/right (the model's most
// common slip) or a one-step angle error gets outvoted without discarding the rest of the answer.
function mergeVotes(votes: PoseDetection[]): PoseDetection {
  const first = votes[0];
  const cost = votes.reduce((sum, vote) => sum + vote.cost, 0);
  const personVisible = votes.filter((vote) => vote.personVisible).length * 2 > votes.length;

  const angles = votes.map((vote) => ANGLES.indexOf(splitPose(vote.pose).angle)).sort((a, b) => a - b);
  // With three votes the median is the majority (or the middle ground); with two we trust the primary call.
  const angle = votes.length >= 3 ? ANGLES[angles[Math.floor(angles.length / 2)]] : splitPose(first.pose).angle;

  const sideVotes = votes.map((vote) => splitPose(vote.pose).side).filter((side): side is "esq" | "dir" => side !== null);
  const esq = sideVotes.filter((side) => side === "esq").length;
  const dir = sideVotes.length - esq;
  const side: Side = esq === dir ? (sideVotes[0] ?? null) : esq > dir ? "esq" : "dir";

  const pose = (angle === "frente" || angle === "costas" ? angle : `${angle}_${side ?? "esq"}`) as Pose;
  const unanimous = votes.every((vote) => vote.pose === pose);
  return { pose, confidence: unanimous ? "alta" : "media", personVisible, model: first.model, cost };
}

// Front/back are what decide which side of the shirt is shown, and one call gets them right reliably.
// Sideways poses, or any call that isn't sure, get two more parallel calls and a vote.
export async function detectPose(photoUrl: string, apiKey: string): Promise<PoseDetection> {
  const first = await classifyWithFallback(photoUrl, apiKey);
  if (first.personVisible && first.confidence === "alta" && (first.pose === "frente" || first.pose === "costas")) return first;

  const extra = await Promise.allSettled([classifyWithFallback(photoUrl, apiKey), classifyWithFallback(photoUrl, apiKey)]);
  const votes = [first, ...extra.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))];
  return mergeVotes(votes);
}
