import { measure, type BodyProfile } from "./body-measure";
import { bodyModel, wearTee } from "./body-model";
import type { SizeRow } from "./products";

const SIZES = ["PP", "P", "M", "G", "GG"];

// Without measurements, how each size sits next to the brand's usual oversized fit (M on an average body).
const RELATIVE: Record<number, string> = {
  [-2]: "um pouco mais justa e mais curta que o caimento padrão da marca, mas ainda com folga: menos tecido nas laterais, a costura do ombro mais perto do ombro e a barra alguns centímetros mais alta",
  [-1]: "quase igual ao caimento padrão da marca, só um pouco menos folgada: continua oversized, com a folga nas laterais um pouco menor e a barra um pouco mais alta",
  [0]: "no caimento padrão da marca, oversized: folga visível nas laterais com o tecido caindo reto, a costura do ombro um pouco além do ombro, as mangas acima do cotovelo e a barra na altura da virilha",
  [1]: "quase igual ao caimento padrão da marca, só um pouco mais folgada: continua oversized, com um pouco mais de folga nas laterais e a barra um pouco mais baixa",
  [2]: "mais larga e mais comprida que o caimento padrão da marca: mais folga nas laterais, a costura do ombro caindo um pouco mais sobre o braço e a barra alguns centímetros abaixo da virilha",
};

const cm = (value: number) => Math.round(Math.abs(value));

// The "size and fit" part of the try-on prompt: how this size of the tee sits on this person. With the customer's
// Meranno Fit measurements it comes from the same body model as the Meranno Fit figure, so the photo and the figure
// agree; without them it describes the size against the brand's usual fit.
// How this size differs from M in centimetres: neighbouring sizes are only a few cm apart, and the image model exaggerates.
function versusM(row: SizeRow, chart?: SizeRow[]) {
  const m = chart?.find((item) => item.size === "M");
  if (!m || row.size === "M") return "";
  const diff = (value: number) => `${cm(value)} cm ${value < 0 ? "a menos" : "a mais"}`;
  return ` Comparado ao M, este tamanho tem só ${diff(row.largura - m.largura)} de largura (${diff((row.largura - m.largura) * 2)} de circunferência), ${diff(row.comprimento - m.comprimento)} de comprimento e ${diff(row.ombro - m.ombro)} de ombro a ombro. É uma diferença PEQUENA: a camiseta deve parecer quase igual à do M, apenas esses poucos centímetros mais ${row.largura < m.largura ? "estreita e curta" : "larga e comprida"}. NÃO exagere: não deixe a peça colada no corpo nem gigante.`;
}

export function describeFit(row: SizeRow, profile?: BodyProfile | null, chart?: SizeRow[]) {
  const garment = `Medidas da peça (deitada): largura ${row.largura} cm (${row.largura * 2} cm de circunferência), comprimento ${row.comprimento} cm, ombro a ombro ${row.ombro} cm.`;
  const rule = `Desenhe a camiseta com esse caimento e essas proporções em relação ao corpo da foto, na medida real: a diferença entre tamanhos vizinhos é de poucos centímetros e deve ficar sutil.${versusM(row, chart)} A estampa mantém o seu tamanho real em relação à peça.`;
  const altura = profile ? measure(profile, "altura") : null;
  const knowsBody = !!profile && !!altura && (!!measure(profile, "busto") || !!measure(profile, "peso"));

  if (!knowsBody) {
    const steps = Math.max(-2, Math.min(2, SIZES.indexOf(row.size) - SIZES.indexOf("M")));
    return `TAMANHO E CAIMENTO (o objetivo desta prova): a camiseta está no tamanho ${row.size}. ${garment} Não temos as medidas da pessoa; trate o M como o tamanho de costume dela. No tamanho ${row.size}, a camiseta fica ${RELATIVE[steps]}. ${rule}`;
  }

  const body = bodyModel(profile);
  const tee = wearTee(body, row);
  const chest = tee.ease < 0 ? "fica apertada: o tecido estica no peito e na barriga, marcando o corpo"
    : tee.ease < 8 ? "fica justa, rente ao corpo, sem sobra de tecido nas laterais"
    : tee.ease < 16 ? "fica levemente solta, com pouca folga nas laterais"
    : tee.ease <= 26 ? "fica ampla, com folga visível nas laterais e o tecido caindo reto (caimento oversized)"
    : "fica muito larga, com bastante tecido sobrando nas laterais e dobras, bem oversized";
  const beyond = tee.shoulder / 2 - body.w.shoulders / 2;
  const shoulder = beyond < 1 ? "a costura do ombro fica em cima do ombro"
    : beyond < 4 ? `a costura do ombro cai cerca de ${cm(beyond)} cm além do ombro, começando a descer pelo braço`
    : `a costura do ombro cai cerca de ${cm(beyond)} cm além do ombro, já sobre a parte de cima do braço`;
  // Where the sleeve ends: from the seam, down the arm, against the elbow.
  const seamHeight = body.y.acromion - Math.max(0, beyond) * 0.8;
  const sleeveEnd = seamHeight - tee.sleeve.length * 0.95 - body.y.elbow;
  const sleeve = sleeveEnd > 9 ? "as mangas terminam no meio do braço, bem acima do cotovelo"
    : sleeveEnd > 4 ? "as mangas terminam um pouco acima do cotovelo"
    : sleeveEnd > -2 ? "as mangas chegam na altura do cotovelo"
    : "as mangas passam do cotovelo";
  const d = tee.hemOverCrotch;
  const hem = d > 8 ? "a barra termina acima do quadril, deixando a peça curta"
    : d > 3 ? "a barra termina na altura do quadril, um pouco acima da virilha"
    : d >= -4 ? "a barra termina na altura da virilha, cobrindo o cós da calça"
    : d >= -11 ? `a barra passa cerca de ${cm(d)} cm da virilha, cobrindo o começo da coxa`
    : "a barra fica longa, chegando ao meio da coxa";
  const person = `A pessoa da foto mede ${altura} cm e tem ${Math.round(body.busto)} cm de busto${body.bustoEstimated ? " (estimado pela altura e pelo peso)" : ""}.`;
  return `TAMANHO E CAIMENTO (o objetivo desta prova): a camiseta está no tamanho ${row.size}. ${garment} ${person} Nesse corpo, a camiseta ${chest}; ${shoulder}; ${sleeve}; e ${hem}. ${rule}`;
}
