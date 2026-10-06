import { measure, type BodyProfile } from "./body-measure";
import { bodyModel, wearTee } from "./body-model";
import type { SizeRow } from "./products";

const SIZES = ["PP", "P", "M", "G", "GG"];

// Without measurements, how each size sits next to the brand's usual oversized fit (M on an average body).
const RELATIVE: Record<number, string> = {
  [-2]: "bem mais justa e curta que o caimento padrão da marca: rente ao corpo, sem folga nas laterais, a costura do ombro em cima do ombro, as mangas curtas no meio do braço e a barra acima da virilha",
  [-1]: "um pouco mais justa e curta que o caimento padrão da marca: pouca folga nas laterais, a costura do ombro quase em cima do ombro e a barra um pouco acima da virilha",
  [0]: "no caimento padrão da marca, oversized: folga visível nas laterais com o tecido caindo reto, a costura do ombro um pouco além do ombro, as mangas acima do cotovelo e a barra na altura da virilha",
  [1]: "mais larga e mais comprida que o caimento padrão da marca: bastante folga nas laterais, a costura do ombro caindo sobre o braço, as mangas perto do cotovelo e a barra abaixo da virilha",
  [2]: "bem larga e longa: muito tecido sobrando nas laterais, com dobras, a costura do ombro caindo bem sobre o braço, as mangas passando do cotovelo e a barra no começo da coxa",
};

const cm = (value: number) => Math.round(Math.abs(value));

// The "size and fit" part of the try-on prompt: how this size of the tee sits on this person. With the customer's
// Merano Fit measurements it comes from the same body model as the Merano Fit figure, so the photo and the figure
// agree; without them it describes the size against the brand's usual fit.
export function describeFit(row: SizeRow, profile?: BodyProfile | null) {
  const garment = `Medidas da peça (deitada): largura ${row.largura} cm (${row.largura * 2} cm de circunferência), comprimento ${row.comprimento} cm, ombro a ombro ${row.ombro} cm.`;
  const rule = "Desenhe a camiseta exatamente com esse caimento e essas proporções em relação ao corpo da foto. NÃO ajuste a peça para \"servir bem\": se o tamanho fica grande ou pequeno nessa pessoa, isso precisa aparecer. A estampa mantém o seu tamanho real: numa peça maior ela ocupa proporcionalmente menos espaço, numa menor ocupa mais.";
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
