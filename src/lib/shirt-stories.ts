// Background-free renders of the shirts (cut out) and a line about each print, for the home showcase and the Sobre nós
// page. `small`/`large` are the two widths saved under recortes/.
export type ShirtCutout = { src: string; small: number; large: number; ratio: number; studio?: boolean };
export type ShirtStory = { id: string; title: string[]; print: string; cutout: ShirtCutout };

export const thumbOf = (story: ShirtStory) => `${story.cutout.src}-thumb.webp`;

const cutout = (name: string, small: number, large: number, height: number): ShirtCutout => ({ src: `/imagens/merano-assets/recortes/${name}`, small, large, ratio: height / large });

export const SHIRT_STORIES: ShirtStory[] = [
  // All re-cut on 2026-11-23 from the owners' official photos (regular cut): edge found against the flat studio white at
  // 4x, at half the shirt's own contrast, edge colours un-mixed from the white.
  { id: "amore-black", title: ["Amore", "Black."], print: "Um coração vermelho em aquarela, rabiscado com anotações à mão.", cutout: cutout("amore-black", 600, 1200, 1303) },
  { id: "amore-white", title: ["Amore", "White."], print: "O mesmo coração em aquarela, com as anotações em preto sobre o algodão branco.", cutout: cutout("amore-white", 600, 1200, 1273) },
  { id: "riviera", title: ["Riviera", "."], print: "Um terraço com limoeiros numa tarde sem pressa: tudo bem, um passo de cada vez.", cutout: cutout("riviera", 600, 1200, 1338) },
  { id: "arancia", title: ["Arancia", "."], print: "Laranjas e flores sobre o azul-marinho. Um verão brasileiro.", cutout: { ...cutout("arancia-v2", 600, 1000, 1090), studio: true } },
  { id: "why-not", title: ["Why", "not."], print: "Uma garrafa de vinho no meio das letras pintadas à mão.", cutout: cutout("why-not", 600, 1200, 1295) },
];

export const getShirtStory = (id: string) => SHIRT_STORIES.find((story) => story.id === id);
