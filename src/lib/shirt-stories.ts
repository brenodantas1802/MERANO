// Background-free renders of the shirts (AI-upscaled, cut out) and a line about each print, for the
// home showcase and the Sobre nós page. `small`/`large` are the two widths saved under recortes/.
export type ShirtCutout = { src: string; small: number; large: number; ratio: number };
export type ShirtStory = { id: string; title: string[]; print: string; cutout: ShirtCutout };

export const thumbOf = (story: ShirtStory) => `${story.cutout.src}-thumb.webp`;

const cutout = (name: string, small: number, large: number, height: number): ShirtCutout => ({ src: `/imagens/merano-assets/recortes/${name}`, small, large, ratio: height / large });

export const SHIRT_STORIES: ShirtStory[] = [
  { id: "coracao-preto", title: ["Coração", "· Preto."], print: "Um coração vermelho em aquarela, rabiscado com anotações à mão.", cutout: cutout("coracao-preto", 575, 1150, 1233) },
  { id: "verao-em-boa-companhia", title: ["Verão em", "boa companhia."], print: "Laranjeira em flor e, escrito à mão: sol, boa comida, boas histórias. Sempre.", cutout: cutout("verao-em-boa-companhia", 1400, 2800, 2777) },
  { id: "wine-not", title: ["Wine", "not?"], print: "Uma garrafa de vinho no meio das letras pintadas à mão.", cutout: cutout("wine-not", 1200, 2400, 2141) },
];

export const FRONT_CUTOUT = cutout("frente-merano", 1200, 2400, 2361);

export const getShirtStory = (id: string) => SHIRT_STORIES.find((story) => story.id === id);
