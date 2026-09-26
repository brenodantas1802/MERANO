import type { Pose } from "./pose";
import type { ShirtViews } from "./products";

export type ViewKey = keyof ShirtViews;

export type TryOnPlan = {
  // Garment shots to send after the person's photo, in the order the prompt refers to them (image 2, 3...).
  views: ViewKey[];
  prompt: string;
};

const VIEW_DESCRIPTIONS: Record<ViewKey, string> = {
  front: "a FRENTE da camiseta",
  back: "as COSTAS (verso) da camiseta",
  left: "a LATERAL ESQUERDA da camiseta (o lado esquerdo de quem a veste)",
  right: "a LATERAL DIREITA da camiseta (o lado direito de quem a veste)",
};

const PRESERVE_PERSON_PROMPT = `EDITAR A FOTO DA PESSOA, não criar uma pessoa nova. A imagem 1 é a foto-base e deve ser preservada: mantenha exatamente a mesma pessoa, rosto, identidade, expressão, tom de pele, cabelo, pose, ângulo do corpo, mãos, proporções corporais, enquadramento, câmera, iluminação e fundo. Faça somente uma troca virtual de roupa sobre a pessoa. Não substitua a pessoa, não mude a pose, não gire nem espelhe o corpo e não faça uma nova sessão de fotos.

As demais imagens mostram a camiseta do produto, sem ninguém vestindo, cada uma de um ângulo. Use-as exclusivamente como referência exata da peça: modelo, corte, caimento, comprimento, gola, mangas, costuras, textura, material, cores, etiquetas e todos os detalhes visuais. Reproduza textos e logotipos exatamente como estão, letra por letra. Não invente logotipos, textos, estampas ou detalhes que não estejam nessas imagens.

Resultado: uma edição fotográfica realista da imagem 1, com a camiseta trocada e todo o restante praticamente idêntico. Preserve a anatomia e evite mãos extras, membros deformados, rosto alterado, pessoa diferente, roupa genérica, estampa inventada ou fundo modificado.`;

const PLAIN_FRONT = "A frente desta camiseta é lisa, sem estampa, sem texto e sem logotipo, na mesma cor, tecido, gola e mangas.";

// Which garment shots to show for each pose. The rule that matters most: the front of the shirt goes on a
// person facing the camera and the back goes on a person facing away, never the other way around.
// Side shots are only sent for a true profile: with a three-quarter pose the model tends to paste the
// side shot's back print onto the sleeve, so those poses get just the front or just the back.
function wantedViews(pose: Pose): ViewKey[] {
  if (pose === "frente" || pose.startsWith("frente_diagonal")) return ["front"];
  if (pose === "costas" || pose.startsWith("costas_diagonal")) return ["back"];
  return [pose.endsWith("_esq") ? "left" : "right", "front", "back"];
}

function orientationInstruction(pose: Pose, has: (key: ViewKey) => boolean, imageOf: (key: ViewKey) => number) {
  // "faces"/"behind" are sides of the IMAGE: the model needs to know where the person's chest and back end up.
  const faces = pose.endsWith("_esq") ? "esquerda" : "direita";
  const behind = faces === "esquerda" ? "direita" : "esquerda";

  if (pose === "frente") {
    if (has("front")) return `A pessoa da imagem 1 está de FRENTE para a câmera. Vista a FRENTE da camiseta (imagem ${imageOf("front")}), exatamente como ela aparece. As costas da camiseta não aparecem nesta foto: NÃO coloque nenhuma estampa das costas no peito.`;
    return `A pessoa da imagem 1 está de FRENTE para a câmera. Não existe foto da frente desta camiseta: a imagem ${imageOf("back")} mostra as COSTAS. ${PLAIN_FRONT} Vista a pessoa com a frente lisa e NÃO copie a estampa das costas para o peito.`;
  }
  if (pose === "costas") {
    return `A pessoa da imagem 1 está de COSTAS para a câmera. Vista as COSTAS da camiseta (imagem ${imageOf("back")}): a estampa fica nas costas da pessoa, na mesma posição, escala e cores da imagem ${imageOf("back")}, sem espelhar. A frente da camiseta não aparece nesta foto.`;
  }
  if (pose.startsWith("frente_diagonal")) {
    const frontRef = has("front") ? `Vista a FRENTE da camiseta (imagem ${imageOf("front")}).` : `A imagem ${imageOf("back")} mostra as COSTAS. ${PLAIN_FRONT}`;
    return `A pessoa da imagem 1 está de frente, com o corpo girado cerca de 45° para a ${faces} da imagem: o peito aponta para a ${faces} e as costas ficam escondidas. ${frontRef} Adapte a peça ao giro do corpo, mantendo a perspectiva e o enquadramento originais. Nada da estampa das costas aparece neste ângulo: NÃO coloque estampa das costas no peito nem nas mangas.`;
  }
  if (pose.startsWith("costas_diagonal")) {
    return `A pessoa da imagem 1 está de costas, com o corpo girado cerca de 45° para a ${faces} da imagem: as costas aparecem para a câmera e o peito fica escondido. Vista as COSTAS da camiseta (imagem ${imageOf("back")}), com a estampa nas costas da pessoa na mesma posição, escala e cores, apenas em perspectiva conforme o giro do corpo. Não mostre a frente da camiseta.`;
  }

  const sideKey: ViewKey = pose.endsWith("_esq") ? "left" : "right";
  const sideRef = has(sideKey) ? ` A imagem ${imageOf(sideKey)} mostra ${VIEW_DESCRIPTIONS[sideKey]}: siga-a como guia principal para a manga, o caimento e o ponto em que a estampa das costas aparece de lado.` : "";
  const chestRule = has("front") ? `O lado do peito mostra apenas o que existe na frente da peça (imagem ${imageOf("front")}).` : `O lado do peito é liso. ${PLAIN_FRONT}`;
  return `A pessoa da imagem 1 está de LADO, em perfil de 90°, voltada para a ${faces} da imagem: o peito dela fica do lado ${faces} da imagem e as COSTAS dela ficam do lado ${behind} da imagem.${sideRef} A estampa das costas (imagem ${imageOf("back")}) só pode aparecer como uma faixa estreita na borda traseira do tronco, do lado ${behind} da imagem, cortada pelo ângulo, e NUNCA no lado do peito nem na manga. ${chestRule} Não vire a pessoa para a câmera.`;
}

export function planTryOn(views: ShirtViews, pose: Pose): TryOnPlan {
  let keys = wantedViews(pose).filter((key) => views[key]);
  // The garment's plain colour/cut/fabric still has to come from somewhere when the catalog has no front shot.
  if (!views.front && !keys.includes("back")) keys = [...keys, "back"];

  const has = (key: ViewKey) => keys.includes(key);
  const imageOf = (key: ViewKey) => keys.indexOf(key) + 2;
  const imageList = [
    "Imagem 1: a foto da pessoa (imagem-base a ser editada).",
    ...keys.map((key, index) => `Imagem ${index + 2}: ${VIEW_DESCRIPTIONS[key]}.`),
  ].join("\n");

  return {
    views: keys,
    prompt: `${PRESERVE_PERSON_PROMPT}\n\n${imageList}\n\n${orientationInstruction(pose, has, imageOf)}`,
  };
}
