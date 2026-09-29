import { z } from "zod";
import { askVision } from "./vision";

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

async function classify(photoUrl: string, apiKey: string): Promise<PoseDetection> {
  const { value, model, cost } = await askVision(apiKey, photoUrl, POSE_PROMPT, "pose", poseSchema, poseAnswer);
  return { pose: value.orientacao, confidence: value.confianca, personVisible: value.pessoa_visivel, model, cost };
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
  const first = await classify(photoUrl, apiKey);
  if (first.personVisible && first.confidence === "alta" && (first.pose === "frente" || first.pose === "costas")) return first;

  const extra = await Promise.allSettled([classify(photoUrl, apiKey), classify(photoUrl, apiKey)]);
  const votes = [first, ...extra.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))];
  return mergeVotes(votes);
}
