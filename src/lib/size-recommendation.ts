import { measure, type BodyProfile } from "./body-measure";
import { AMPLE_EASE, bodyModel, HEM_ABOVE_CROTCH, wearTee } from "./body-model";
import type { SizeRow } from "./products";

export type SizeRecommendation = { size: string; reason: string };

// Room a tee needs over the belly and the hips (cm of circumference); the chest takes AMPLE_EASE.
const WAIST_EASE = 8;
const HIP_EASE = 6;

// `label` completes "Pensado ...", so it carries its own preposition (no seu / na sua / nos seus).
type Constraint = { label: string; fits: (row: SizeRow) => boolean };

// Picks the smallest size that satisfies every measurement the customer gave, and names the measurement that decided
// it. The chart is the garment's own flat measurements (width is half the circumference). Without a measured chest,
// height and weight give an estimate of it.
export function recommendSize(profile: BodyProfile, chart: SizeRow[]): SizeRecommendation | null {
  const busto = measure(profile, "busto");
  const quadril = measure(profile, "quadril");
  const cintura = measure(profile, "cintura");
  const ombro = measure(profile, "ombro");
  const altura = measure(profile, "altura");
  const peso = measure(profile, "peso");
  const body = bodyModel(profile);

  const constraints: Constraint[] = [];
  if (busto) constraints.push({ label: `no seu busto de ${busto} cm`, fits: (row) => row.largura * 2 >= busto + AMPLE_EASE });
  else if (altura && peso) constraints.push({ label: `na sua altura e no seu peso (busto estimado em ${Math.round(body.busto)} cm)`, fits: (row) => row.largura * 2 >= body.busto + AMPLE_EASE });
  if (cintura) constraints.push({ label: `na sua cintura de ${cintura} cm`, fits: (row) => row.largura * 2 >= cintura + WAIST_EASE });
  if (quadril) constraints.push({ label: `no seu quadril de ${quadril} cm`, fits: (row) => row.largura * 2 >= quadril + HIP_EASE });
  if (ombro) constraints.push({ label: `nos seus ombros de ${ombro} cm`, fits: (row) => row.ombro >= ombro });
  // Width is what decides a tee; length alone isn't enough to recommend anything.
  if (!constraints.length) return null;
  // Length only moves the size for tall bodies: the hem has to reach close to the crotch.
  if (altura) constraints.push({ label: `na sua altura de ${altura} cm`, fits: (row) => wearTee(body, row).hemOverCrotch <= HEM_ABOVE_CROTCH });

  let index = 0;
  let decidedBy = constraints[0];
  for (const constraint of constraints) {
    const smallest = chart.findIndex(constraint.fits);
    const needed = smallest === -1 ? chart.length - 1 : smallest;
    if (needed > index) {
      index = needed;
      decidedBy = constraint;
    }
  }
  return { size: chart[index].size, reason: `Pensado ${decidedBy.label}, com a folga da modelagem ampla.` };
}
