import { z } from "zod";
import { FONTES, ESTAMPAS_CASA, MAX_PALETA, MAX_REFERENCIAS, MODELAGENS, isHex, type Ficha, type FonteId, type EstampaCasaId, type Modelagem } from "./estampa";

const hex = z.string().refine(isHex, "Cor inválida.");
const curto = (max: number) => z.string().max(max).transform((value) => value.trim());

export const painelSchema = z.object({
  modelagem: z.enum(MODELAGENS.map((m) => m.id) as [Modelagem, ...Modelagem[]]),
  paleta: z.array(hex).min(1).max(MAX_PALETA),
  fonte: z.enum(FONTES.map((f) => f.id) as [FonteId, ...FonteId[]]),
  corEscrita: hex,
  estampaCasa: z.enum(ESTAMPAS_CASA.map((e) => e.id) as [EstampaCasaId, ...EstampaCasaId[]]).nullable(),
});

export const fichaSchema = z.object({
  ideia: curto(400),
  elementos: z.array(curto(120)).max(10),
  estilo: curto(200),
  composicao: curto(200),
  cores: z.array(hex).max(MAX_PALETA),
  texto: curto(40),
  evitar: z.array(curto(120)).max(8),
  usarReferencias: z.boolean(),
});

// Reference images are downscaled in the browser (about 1024 px JPEG), so each one stays far below this.
export const referenciasSchema = z.array(z.string().startsWith("data:image/", "Referência inválida.").max(2_000_000, "Referência muito grande.")).max(MAX_REFERENCIAS);

// What the chat model returns, loosely: it is cleaned into a Ficha before reaching the page.
export const respostaChatSchema = z.object({
  resposta: z.string(),
  ficha: z.object({
    ideia: z.string().catch(""),
    elementos: z.array(z.string()).catch([]),
    estilo: z.string().catch(""),
    composicao: z.string().catch(""),
    cores: z.array(z.string()).catch([]),
    texto: z.string().catch(""),
    evitar: z.array(z.string()).catch([]),
    usar_referencias: z.boolean().catch(false),
  }),
  sugestoes: z.array(z.string()).catch([]),
  pronto: z.boolean().catch(false),
  esboco: z.string().catch(""),
});

export function normalizarFicha(raw: z.infer<typeof respostaChatSchema>["ficha"]): Ficha {
  const lista = (items: string[], max: number, size: number) => items.map((item) => item.trim().slice(0, size)).filter(Boolean).slice(0, max);
  return {
    ideia: raw.ideia.trim().slice(0, 400),
    elementos: lista(raw.elementos, 10, 120),
    estilo: raw.estilo.trim().slice(0, 200),
    composicao: raw.composicao.trim().slice(0, 200),
    cores: raw.cores.map((cor) => cor.trim()).filter(isHex).slice(0, MAX_PALETA),
    texto: raw.texto.trim().slice(0, 40),
    evitar: lista(raw.evitar, 8, 120),
    usarReferencias: raw.usar_referencias,
  };
}
