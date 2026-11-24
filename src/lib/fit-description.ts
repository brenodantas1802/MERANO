import { measure, type BodyProfile } from "./body-measure";
import { bodyModel, ombroDa, OPENING_PER_WIDTH, SLEEVE_PER_LENGTH, wearTee } from "./body-model";
import type { SizeRow } from "./products";

const SIZES = ["P", "M", "G"];

// The cut itself, said in every try-on. Since 2026-11-23 the garment shots are the owners' official photos of this
// same regular tee (before, mockups of an older dropped-shoulder cut the model had to be told to ignore).
// The proportions are measured on those photos (seen from the back, all five alike): body width 0.56-0.60 of the
// length from collar to hem, sleeves ending at 0.44-0.50 of it. On a person the image model kept the silhouette of the
// shirt they had on (a loose tee came out with dropped shoulders and elbow-length sleeves), hence the numbers.
export const CORTE_REGULAR = "MODELAGEM DA PEÇA: camiseta REGULAR, de corte clássico e reto (NÃO é oversized, NÃO é boxy, NÃO tem ombro caído). As fotos de referência mostram esta mesma peça, nesse corte: siga delas o formato da camiseta (gola, ombro, mangas e corpo), além da cor, da estampa, da assinatura e do tecido. PROPORÇÕES DA PEÇA, as mesmas das fotos de referência: a costura do ombro fica na ponta do ombro da pessoa (num tamanho grande para ela, no máximo poucos centímetros além), nunca no ombro caído de uma camiseta oversized; as mangas são curtas e retas, cobrem só a metade de cima do braço e terminam bem acima do cotovelo, com a abertura a poucos centímetros do braço (nada de manga larga, comprida ou em sino); o corpo cai reto e é mais comprido do que largo: de costas, a largura da camiseta é pouco mais da metade do comprimento dela (cerca de 0,58 vez a distância da gola até a barra; uma camiseta quase tão larga quanto comprida está ERRADA). As laterais descem retas, só um pouco afastadas do tronco, sem volume sobrando, e abaixo das mangas os braços aparecem ao lado do corpo, com o tecido sem cobri-los.";

// Without measurements, how each size sits next to the brand's usual regular fit (M on an average body).
const RELATIVE: Record<number, string> = {
  [-2]: "mais justa e mais curta que o caimento regular da marca: rente ao corpo, marcando o peito, e a barra alguns centímetros mais alta",
  [-1]: "quase igual ao caimento regular da marca, só um pouco mais justa: pouca folga nas laterais e a barra um pouco mais alta",
  [0]: "no caimento regular da marca: folga leve nas laterais com o tecido caindo reto, a costura do ombro na ponta do ombro, as mangas no meio do braço e a barra cobrindo o cós da calça",
  [1]: "quase igual ao caimento regular da marca, só um pouco mais folgada: um pouco mais de folga nas laterais, a costura do ombro um pouco além da ponta do ombro e a barra um pouco mais baixa",
  [2]: "mais larga e mais comprida que o caimento regular da marca: folga visível nas laterais, a costura do ombro descendo um pouco pelo braço e a barra alguns centímetros mais baixa",
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
  // Where the sleeve ends moves with half the shoulder change plus the sleeve length (same ratios as body-model).
  const shift = Math.round(((ombroDa(m) - ombroDa(row)) / 2 + (m.comprimento - row.comprimento) * SLEEVE_PER_LENGTH) * 2) / 2;
  const opening = Math.round(Math.abs(row.largura - m.largura) * OPENING_PER_WIDTH * 2) / 2;
  const sleeve = ` AS MANGAS ficam praticamente iguais às do M: terminam só cerca de ${String(Math.abs(shift)).replace(".", ",")} cm ${shift > 0 ? "mais acima" : "mais abaixo"} no braço e a abertura é cerca de ${String(opening).replace(".", ",")} cm ${row.largura < m.largura ? "mais estreita" : "mais larga"}. Mantenha o mesmo comprimento visual de manga do M, a mesma folga em volta do braço e a mesma posição em relação ao cotovelo; NÃO encurte nem afine a manga além disso.`;
  return ` Comparado ao M, este tamanho tem só ${diff(row.largura - m.largura)} de largura (${diff((row.largura - m.largura) * 2)} de circunferência), ${diff(row.comprimento - m.comprimento)} de comprimento e ${diff(ombroDa(row) - ombroDa(m))} de ombro a ombro. É uma diferença PEQUENA: a camiseta deve parecer quase igual à do M, apenas esses poucos centímetros mais ${row.largura < m.largura ? "estreita e curta" : "larga e comprida"}.${sleeve} NÃO exagere: não deixe a peça colada no corpo nem gigante.`;
}

export function describeFit(row: SizeRow, profile?: BodyProfile | null, chart?: SizeRow[]) {
  const garment = `Medidas da peça (deitada): largura ${row.largura} cm (${row.largura * 2} cm de circunferência), comprimento ${row.comprimento} cm, ombro a ombro cerca de ${ombroDa(row)} cm.`;
  const rule = `Desenhe a camiseta com esse caimento e essas proporções em relação ao corpo da foto, na medida real: a diferença entre tamanhos vizinhos é de poucos centímetros e deve ficar sutil.${versusM(row, chart)} A estampa mantém o seu tamanho real em relação à peça.`;
  const altura = profile ? measure(profile, "altura") : null;
  const knowsBody = !!profile && !!altura && (!!measure(profile, "busto") || !!measure(profile, "peso"));

  if (!knowsBody) {
    const steps = Math.max(-2, Math.min(2, SIZES.indexOf(row.size) - SIZES.indexOf("M")));
    return `${CORTE_REGULAR} TAMANHO E CAIMENTO (o objetivo desta prova): a camiseta está no tamanho ${row.size}. ${garment} Não temos as medidas da pessoa; trate o M como o tamanho de costume dela. No tamanho ${row.size}, a camiseta fica ${RELATIVE[steps]}. ${rule}`;
  }

  const body = bodyModel(profile);
  const tee = wearTee(body, row);
  const chest = tee.ease < 0 ? "fica apertada: o tecido estica no peito e na barriga, marcando o corpo"
    : tee.ease < 3 ? "fica justa, rente ao corpo, sem sobra de tecido nas laterais"
    : tee.ease <= 13 ? "fica no caimento regular: folga leve nas laterais e o tecido caindo reto, sem sobrar"
    : tee.ease <= 20 ? "fica um pouco solta, com folga visível nas laterais"
    : "fica larga, com tecido sobrando nas laterais";
  const beyond = tee.shoulder / 2 - body.w.shoulders / 2;
  const shoulder = beyond < 1 ? "a costura do ombro fica em cima do ombro"
    : beyond < 4 ? `a costura do ombro cai cerca de ${cm(beyond)} cm além do ombro, começando a descer pelo braço`
    : `a costura do ombro cai cerca de ${cm(beyond)} cm além do ombro, já sobre a parte de cima do braço`;
  // Where the sleeve ends: from the seam, down the arm, against the elbow. Worked out on the M, because the words
  // ("meio do braço", "acima do cotovelo") flip between neighbouring sizes; the cm difference is in versusM.
  const mRow = chart?.find((item) => item.size === "M") ?? row;
  const mTee = wearTee(body, mRow);
  const mBeyond = mTee.shoulder / 2 - body.w.shoulders / 2;
  const seamHeight = body.y.acromion - Math.max(0, mBeyond) * 0.8;
  const sleeveEnd = seamHeight - mTee.sleeve.length * 0.95 - body.y.elbow;
  const sleeveWhere = sleeveEnd > 9 ? "terminam no meio do braço, bem acima do cotovelo"
    : sleeveEnd > 4 ? "terminam um pouco acima do cotovelo"
    : sleeveEnd > -2 ? "chegam na altura do cotovelo"
    : "passam do cotovelo";
  const sleeve = mRow === row ? `as mangas ${sleeveWhere}` : `as mangas ficam quase como no M, onde ${sleeveWhere}`;
  const d = tee.hemOverCrotch;
  const hem = d > 8 ? "a barra termina acima do quadril, deixando a peça curta"
    : d > 3 ? "a barra termina na altura do quadril, um pouco acima da virilha"
    : d >= -4 ? "a barra termina na altura da virilha, cobrindo o cós da calça"
    : d >= -11 ? `a barra passa cerca de ${cm(d)} cm da virilha, cobrindo o começo da coxa`
    : "a barra fica longa, chegando ao meio da coxa";
  const person = `A pessoa da foto mede ${altura} cm e tem ${Math.round(body.busto)} cm de busto${body.bustoEstimated ? " (estimado pela altura e pelo peso)" : ""}.`;
  return `${CORTE_REGULAR} TAMANHO E CAIMENTO (o objetivo desta prova): a camiseta está no tamanho ${row.size}. ${garment} ${person} Nesse corpo, a camiseta ${chest}; ${shoulder}; ${sleeve}; e ${hem}. ${rule}`;
}
