import { measure, type BodyProfile } from "./body-profile";
import type { SizeRow } from "./products";

export type SizeRecommendation = { size: string; reason: string };

// Ease on top of the body for the brand's wide ("ampla") cut, in cm of circumference or length.
const CHEST_EASE = 8;
const HIP_EASE = 4;
const WAIST_EASE = 4;
// A tee should run from the base of the neck to below the hips: torso length plus this much.
const BELOW_WAIST = 24;
// Without a torso measurement, a comfortable tee length is roughly this share of the height.
const LENGTH_PER_HEIGHT = 0.41;
const LENGTH_TOLERANCE = 3;

// `label` completes "Pensado ...", so it carries its own preposition (no seu / na sua / nos seus).
type Constraint = { label: string; fits: (row: SizeRow) => boolean };

// Picks the smallest size that satisfies every measurement the customer gave, and names the measurement
// that decided it. The chart is the garment's own flat measurements (width is half the circumference).
export function recommendSize(profile: BodyProfile, chart: SizeRow[]): SizeRecommendation | null {
  const busto = measure(profile, "busto");
  const quadril = measure(profile, "quadril");
  const cintura = measure(profile, "cintura");
  const ombro = measure(profile, "ombro");
  const tronco = measure(profile, "tronco");
  const altura = measure(profile, "altura");

  const constraints: Constraint[] = [];
  if (busto) constraints.push({ label: `no seu busto de ${busto} cm`, fits: (row) => row.largura * 2 >= busto + CHEST_EASE });
  if (quadril) constraints.push({ label: `no seu quadril de ${quadril} cm`, fits: (row) => row.largura * 2 >= quadril + HIP_EASE });
  if (cintura) constraints.push({ label: `na sua cintura de ${cintura} cm`, fits: (row) => row.largura * 2 >= cintura + WAIST_EASE });
  if (ombro) constraints.push({ label: `nos seus ombros de ${ombro} cm`, fits: (row) => row.ombro >= ombro });
  // Width is what decides a tee; length alone isn't enough to recommend anything.
  if (!constraints.length) return null;
  if (tronco) constraints.push({ label: `no seu tronco de ${tronco} cm`, fits: (row) => row.comprimento >= tronco + BELOW_WAIST });
  else if (altura) constraints.push({ label: `na sua altura de ${altura} cm`, fits: (row) => row.comprimento >= altura * LENGTH_PER_HEIGHT - LENGTH_TOLERANCE });

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
