// Background-free renders of the shirts (AI-upscaled, cut out) and a line about each print, for the
// home showcase and the Sobre nós page. `small`/`large` are the two widths saved under recortes/.
export type ShirtCutout = { src: string; small: number; large: number; ratio: number };
export type ShirtStory = { id: string; title: string[]; print: string; cutout: ShirtCutout };

export const thumbOf = (story: ShirtStory) => `${story.cutout.src}-thumb.webp`;

const cutout = (name: string, small: number, large: number, height: number): ShirtCutout => ({ src: `/imagens/merano-assets/recortes/${name}`, small, large, ratio: height / large });

export const SHIRT_STORIES: ShirtStory[] = [
  { id: "verao-em-boa-companhia", title: ["Verão em", "boa companhia."], print: "Laranjeira em flor e, escrito à mão: sol, boa comida, boas histórias. Sempre.", cutout: cutout("verao-em-boa-companhia", 1400, 2800, 2777) },
  { id: "rastro-no-lago", title: ["Rastro", "no lago."], print: "Um barco de madeira abre caminho no lago entre montanhas, em pinceladas grossas de azul.", cutout: cutout("rastro-no-lago", 1200, 2400, 2366) },
  { id: "match-point", title: ["Match", "point."], print: "A grama, o placar e a arquibancada cheia no ponto decisivo, pintados em pinceladas soltas.", cutout: cutout("match-point", 1200, 2400, 2370) },
  { id: "terraco-ao-mar", title: ["Terraço", "ao mar."], print: "Mesa posta sob a pérgola de limoeiros, vinho aberto e o mar logo ali embaixo.", cutout: cutout("terraco-ao-mar", 1200, 2400, 2124) },
  { id: "who-cares", title: ["Who cares,", "I’m already late."], print: "Os números de um relógio se soltam e racham em volta de “Who cares, I’m already late”.", cutout: cutout("who-cares", 1200, 2400, 2407) },
  { id: "mares-tranquilos", title: ["Mares", "tranquilos."], print: "Um barco de pesca em água parada, desenhado a traço fino em azul-marinho.", cutout: cutout("mares-tranquilos", 1200, 2400, 2317) },
  { id: "cafe", title: ["Café", "de esquina."], print: "A fachada de um café de esquina, mesa na calçada e taça na mão, em traço de nanquim.", cutout: cutout("cafe", 1200, 2400, 2254) },
];

export const FRONT_CUTOUT = cutout("frente-merano", 1200, 2400, 2361);

export const getShirtStory = (id: string) => SHIRT_STORIES.find((story) => story.id === id);
