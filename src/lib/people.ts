import { z } from "zod";
import { askVision } from "./vision";

// Normalized (0 to 1) box around one person, measured from the image's top-left corner.
export type PersonBox = { x: number; y: number; w: number; h: number };

export type PeopleDetection = {
  // People big enough to be who the customer means, left to right. One means there's nothing to choose.
  people: PersonBox[];
  // Everyone found, including people small in the background (they still must not get dressed).
  total: number;
  cost: number;
};

const MAX_PEOPLE = 6;
// Someone much smaller than the biggest person is background, not a candidate.
const RELEVANT_HEIGHT_RATIO = 0.6;

const PEOPLE_PROMPT = `Você é o detector de pessoas de um provador virtual de camisetas. Liste TODAS as pessoas visíveis na foto cujo tronco (peito ou costas) apareça, mesmo de costas ou de lado.

Para cada pessoa devolva a caixa que envolve o corpo visível dela, da cabeça até onde o corpo aparece na foto, em coordenadas inteiras de 0 a 1000 (ymin, xmin, ymax, xmax), com (0, 0) no canto superior esquerdo da imagem e (1000, 1000) no inferior direito. Ordene da esquerda para a direita.

Regras:
- Inclua também as pessoas pequenas ao fundo, com a caixa delas.
- Não invente pessoas. Ignore pessoas que aparecem só em fotos, quadros, cartazes ou telas.
- Se a mesma pessoa aparece duas vezes (por exemplo ela e o reflexo dela no espelho), conte uma vez só.`;

const peopleSchema = {
  type: "object",
  properties: {
    pessoas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ymin: { type: "integer" },
          xmin: { type: "integer" },
          ymax: { type: "integer" },
          xmax: { type: "integer" },
        },
        required: ["ymin", "xmin", "ymax", "xmax"],
        additionalProperties: false,
      },
    },
  },
  required: ["pessoas"],
  additionalProperties: false,
};

const peopleAnswer = z.object({
  pessoas: z.array(z.object({ ymin: z.number(), xmin: z.number(), ymax: z.number(), xmax: z.number() })),
});

const clamp = (value: number) => Math.min(1000, Math.max(0, value)) / 1000;

export async function detectPeople(photoUrl: string, apiKey: string): Promise<PeopleDetection> {
  const { value, cost } = await askVision(apiKey, photoUrl, PEOPLE_PROMPT, "people", peopleSchema, peopleAnswer);

  const boxes = value.pessoas
    .map((p): PersonBox => ({ x: clamp(p.xmin), y: clamp(p.ymin), w: clamp(p.xmax) - clamp(p.xmin), h: clamp(p.ymax) - clamp(p.ymin) }))
    .filter((box) => box.w > 0.02 && box.h > 0.05)
    .slice(0, MAX_PEOPLE)
    .sort((a, b) => a.x + a.w / 2 - (b.x + b.w / 2));

  const tallest = Math.max(0, ...boxes.map((box) => box.h));
  return { people: boxes.filter((box) => box.h >= tallest * RELEVANT_HEIGHT_RATIO), total: boxes.length, cost };
}
