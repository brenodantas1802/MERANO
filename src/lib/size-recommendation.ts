import { measure, type BodyProfile } from "./body-measure";
import { AMPLE_EASE, bodyModel, HEM_ABOVE_CROTCH, wearTee } from "./body-model";
import type { SizeRow } from "./products";

// `beyond`: the body asks for more than the largest size sold; that size is suggested, and it sits closer than designed.
export type SizeRecommendation = { size: string; reason: string; beyond?: boolean };

// Room the tee needs over the belly and the hips (cm of circumference), against the hem width; the chest takes
// AMPLE_EASE against the chest width.
const WAIST_EASE = 6;
const HIP_EASE = 4;

// `label` completes "Pensado ...", so it carries its own preposition (no seu / na sua / nos seus).
type Constraint = { label: string; fits: (row: SizeRow) => boolean };

// Picks the smallest size that fits every measurement the customer gave, and names the measurement that decided it.
// The chart is the garment's own flat measurements (width is half the circumference). The chest decides almost
// always: measured, or estimated from height and weight. The shoulders count only on charts that measure them, and
// height only for very tall bodies, so a rough tape measure at home can't throw the size off.
export function recommendSize(profile: BodyProfile, chart: SizeRow[]): SizeRecommendation | null {
  const busto = measure(profile, "busto");
  const quadril = measure(profile, "quadril");
  const cintura = measure(profile, "cintura");
  const ombro = measure(profile, "ombro");
  const altura = measure(profile, "altura");
  const peso = measure(profile, "peso");
  const body = bodyModel(profile);
  const barra = (row: SizeRow) => (row.barra ?? row.largura) * 2;

  const constraints: Constraint[] = [];
  if (busto) constraints.push({ label: `no seu busto de ${busto} cm`, fits: (row) => row.largura * 2 >= busto + AMPLE_EASE });
  else if (altura && peso) constraints.push({ label: `na sua altura e no seu peso (busto estimado em ${Math.round(body.busto)} cm)`, fits: (row) => row.largura * 2 >= body.busto + AMPLE_EASE });
  if (cintura) constraints.push({ label: `na sua cintura de ${cintura} cm`, fits: (row) => barra(row) >= cintura + WAIST_EASE });
  if (quadril) constraints.push({ label: `no seu quadril de ${quadril} cm`, fits: (row) => barra(row) >= quadril + HIP_EASE });
  if (ombro && chart.every((row) => row.ombro)) constraints.push({ label: `nos seus ombros de ${ombro} cm`, fits: (row) => (row.ombro ?? 0) >= ombro });
  // Width is what decides a tee; length alone isn't enough to recommend anything.
  if (!constraints.length) return null;
  // Length only moves the size for tall bodies: the hem has to reach close to the crotch.
  if (altura) constraints.push({ label: `na sua altura de ${altura} cm`, fits: (row) => wearTee(body, row).hemOverCrotch <= HEM_ABOVE_CROTCH });

  let index = 0;
  let decidedBy = constraints[0];
  let beyond: Constraint | null = null;
  for (const constraint of constraints) {
    const smallest = chart.findIndex(constraint.fits);
    if (smallest === -1) beyond ??= constraint;
    const needed = smallest === -1 ? chart.length - 1 : smallest;
    if (needed > index) {
      index = needed;
      decidedBy = constraint;
    }
  }
  const size = chart[index].size;
  if (beyond) return { size, beyond: true, reason: `O ${size} é o nosso maior tamanho. Pensado ${beyond.label}, ele veste mais justo que o caimento regular.` };
  return { size, reason: `Pensado ${decidedBy.label}, no caimento regular.` };
}
