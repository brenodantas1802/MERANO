import { measure, type BodyProfile } from "./body-measure";
import { bodyModel, wearTee } from "./body-model";
import type { SizeRow } from "./products";

export type SizeFit = { size: string; label: "Justo" | "Ideal" | "Não indicado"; description: string };
export type SizeRecommendation = { size: string; reason: string; beyond?: boolean; comfortLimited?: boolean; fits: SizeFit[] };

type Dimension = {
  kind: "width" | "length";
  gap: (row: SizeRow) => number;
  minimum: number;
  comfortable: number;
  maximum?: number;
  scale: number;
};

// Fit preferences in centimetres, applied to actual garment/body differences, never to named sizes or profiles.
// Circumference margins are total fabric ease; length margins are relative to the estimated crotch.
const EASE = { chest: { minimum: 6, comfortable: 12 }, waist: { minimum: 6, comfortable: 8 }, hip: { minimum: 4, comfortable: 8 } };
const LENGTH = { minimum: -2, comfortable: 0, maximum: 11 };

export function recommendSize(profile: BodyProfile, chart: SizeRow[]): SizeRecommendation | null {
  if (!chart.length) return null;
  const altura = measure(profile, "altura");
  const peso = measure(profile, "peso");
  const body = bodyModel(profile);
  const canEstimate = !!altura && !!peso;
  const chest = measure(profile, "busto") ?? (canEstimate ? body.busto : null);
  const waist = measure(profile, "cintura") ?? (canEstimate ? body.cintura : null);
  const hip = measure(profile, "quadril") ?? (canEstimate ? body.quadril : null);
  const shoulder = measure(profile, "ombro");
  const hemCircumference = (row: SizeRow) => (row.barra ?? row.largura) * 2;
  const dimensions: Dimension[] = [];
  if (chest) dimensions.push({ kind: "width", gap: row => row.largura * 2 - chest, ...EASE.chest, scale: 6 });
  if (waist) dimensions.push({ kind: "width", gap: row => hemCircumference(row) - waist, ...EASE.waist, scale: 6 });
  if (hip) dimensions.push({ kind: "width", gap: row => hemCircumference(row) - hip, ...EASE.hip, scale: 6 });
  if (shoulder && chart.every(row => row.ombro != null)) {
    dimensions.push({ kind: "width", gap: row => row.ombro! - shoulder, minimum: 0, comfortable: 1, scale: 2 });
  }
  // Height or weight alone cannot establish how much room a body needs inside the garment.
  if (!dimensions.length) return null;
  if (altura) dimensions.push({ kind: "length", gap: row => -wearTee(body, row).hemOverCrotch, ...LENGTH, scale: 3 });

  // Evaluate each row independently. No assumption that P/M/G are ordered or spaced equally.
  const evaluated = chart.map(row => {
    const margins = dimensions.map(dimension => ({ ...dimension, value: dimension.gap(row) }));
    const fits = margins.every(d => d.value >= d.minimum && (d.maximum == null || d.value <= d.maximum));
    const comfortable = fits && margins.every(d => d.value >= d.comfortable);
    const score = margins.reduce((total, d) => total + Math.abs(d.value - d.comfortable) / d.scale, 0);
    const deficit = margins.reduce((total, d) => total + (Math.max(0, d.minimum - d.value) + Math.max(0, d.value - (d.maximum ?? Infinity))) / d.scale, 0);
    return { row, margins, fits, comfortable, score, deficit };
  });
  const ideals = evaluated.filter(item => item.comfortable).sort((a, b) => a.score - b.score);
  const closer = evaluated.filter(item => item.fits).sort((a, b) => a.score - b.score);
  const ideal = ideals[0];
  const selected = ideal ?? closer[0] ?? [...evaluated].sort((a, b) => a.deficit - b.deficit || a.score - b.score)[0];
  const fits: SizeFit[] = evaluated.map(item => {
    const size = item.row.size;
    const length = item.margins.find(d => d.kind === "length");
    if (!item.fits) {
      const description = length && length.value < length.minimum ? "fica curta para a sua altura"
        : length && length.maximum != null && length.value > length.maximum ? "fica comprida demais para a sua altura"
        : "fica apertada para as suas medidas";
      return { size, label: "Não indicado", description };
    }
    if (item === ideal) return { size, label: "Ideal", description: "oferece folga confortável e comprimento adequado às suas medidas" };
    if (!item.comfortable) return { size, label: "Justo", description: "tem menos folga no corpo ou no comprimento do que o ideal para conforto" };
    return { size, label: "Não indicado", description: "fica mais solta ou comprida que o caimento recomendado" };
  });
  const context = [altura ? altura + " cm de altura" : null, peso ? peso + " kg" : null].filter(Boolean).join(" e ");
  const basedOn = context ? "Para " + context + ", considerando suas medidas: " : "Considerando suas medidas: ";
  const size = selected.row.size;
  if (!ideal) return {
    size, fits, comfortLimited: true, beyond: !closer.length,
    reason: basedOn + (closer.length ? "o " + size + " é a opção mais próxima, mas falta folga no corpo ou no comprimento para um caimento confortável." : "nenhum dos tamanhos disponíveis atende às medidas para o caimento recomendado. Confira a tabela antes de escolher."),
  };
  return { size, fits, reason: basedOn + "o " + size + " equilibra a folga no corpo com o comprimento da peça." };
}
