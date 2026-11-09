// Personalizador MERANNO: the customer builds a tee — a fixed MERANNO lettering on the front, a print of their own on the back.
// The chat fills the briefing (Ficha); the image prompt is built here from it, never written freely by the model,
// so the customer can read and confirm every detail before anything paid is generated.

export const BRAND_WORD = "MERANNO";

export type Modelagem = "regular" | "oversized" | "boxy";
export const MODELAGENS: { id: Modelagem; nome: string; nota: string }[] = [
  { id: "regular", nome: "Regular", nota: "Ombro alinhado, corte reto" },
  { id: "oversized", nome: "Oversized", nota: "Ombro caído, mangas amplas" },
  { id: "boxy", nome: "Boxy", nota: "Larga e mais curta" },
];

// Shirt colours shown in the prototype. Which ones are really in stock is the owners' call.
export const CORES_MALHA: { nome: string; hex: string }[] = [
  { nome: "Off White", hex: "#F6F2E6" },
  { nome: "Preto", hex: "#0A0A0A" },
  { nome: "Marinho", hex: "#2E3A64" },
  { nome: "Verde musgo", hex: "#4F5E55" },
  { nome: "Marrom", hex: "#5B3A29" },
  { nome: "Vermelho", hex: "#C20000" },
  { nome: "Amarelo", hex: "#F2D530" },
  { nome: "Azul royal", hex: "#1E56C8" },
  { nome: "Verde", hex: "#0B7A4B" },
];

// The fixed MERANNO lettering styles for the front. `css` is the CSS variable set by the page's layout (next/font).
export type FonteId = "cormorant" | "bodoni" | "cinzel" | "pinyon" | "limelight" | "grotesk";
export const FONTES: { id: FonteId; nome: string; css: string; caixa: "alta" | "livre"; espaco: number }[] = [
  { id: "cormorant", nome: "Cormorant", css: "var(--font-cormorant)", caixa: "alta", espaco: 0.32 },
  { id: "bodoni", nome: "Bodoni Moda", css: "var(--font-bodoni)", caixa: "alta", espaco: 0.22 },
  { id: "cinzel", nome: "Cinzel", css: "var(--font-cinzel)", caixa: "alta", espaco: 0.28 },
  { id: "pinyon", nome: "Pinyon Script", css: "var(--font-pinyon)", caixa: "livre", espaco: 0.02 },
  { id: "limelight", nome: "Limelight", css: "var(--font-limelight)", caixa: "alta", espaco: 0.12 },
  { id: "grotesk", nome: "Space Grotesk", css: "var(--font-grotesk)", caixa: "alta", espaco: 0.2 },
];

export const fonteDe = (id: FonteId) => FONTES.find((fonte) => fonte.id === id) ?? FONTES[0];
// Script lettering reads as a signature ("Meranno"); the others are set in capitals.
export const escritaDe = (id: FonteId) => (fonteDe(id).caixa === "livre" ? "Meranno" : BRAND_WORD);

// House prints the customer can start from. The two engravings are alpha masks (they take any ink colour).
export type EstampaCasaId = "barco" | "cafe" | "laranjeira";
export const ESTAMPAS_CASA: { id: EstampaCasaId; nome: string; src: string; largura: number; altura: number; tinta: boolean; descricao: string }[] = [
  { id: "barco", nome: "Mares tranquilos", src: "/imagens/merano-assets/ilustracoes/barco.webp", largura: 836, altura: 522, tinta: true, descricao: "gravura em traço fino de um barco de pesca em mar calmo" },
  { id: "cafe", nome: "Café", src: "/imagens/merano-assets/ilustracoes/cafe.webp", largura: 772, altura: 965, tinta: true, descricao: "gravura em traço fino da fachada de um café com mesa na calçada" },
  { id: "laranjeira", nome: "Verão em boa companhia", src: "/imagens/merano-assets/ilustracoes/laranjeira.webp", largura: 891, altura: 944, tinta: false, descricao: "ilustração pintada de um ramo de laranjeira com frutos e flores" },
];
export const estampaCasaDe = (id: string) => ESTAMPAS_CASA.find((estampa) => estampa.id === id);

export const MAX_PALETA = 5; // the shirt colour plus up to four print colours
export const MAX_REFERENCIAS = 3;

export type Painel = {
  modelagem: Modelagem;
  // paleta[0] is always the shirt colour.
  paleta: string[];
  fonte: FonteId;
  // Lettering colour for MERANNO on the front (one of the palette colours).
  corEscrita: string;
  estampaCasa: EstampaCasaId | null;
};

export const PAINEL_PADRAO: Painel = { modelagem: "regular", paleta: ["#0A0A0A", "#F6F2E6", "#C20000"], fonte: "cormorant", corEscrita: "#F6F2E6", estampaCasa: null };

// The briefing for the back print. Strings, so the chat can fill it bit by bit and the customer can edit it.
export type Ficha = {
  ideia: string;
  elementos: string[];
  estilo: string;
  composicao: string;
  cores: string[];
  texto: string;
  evitar: string[];
  usarReferencias: boolean;
};

export const FICHA_VAZIA: Ficha = { ideia: "", elementos: [], estilo: "", composicao: "", cores: [], texto: "", evitar: [], usarReferencias: false };

const HEX = /^#[0-9a-f]{6}$/i;
export const isHex = (value: string) => HEX.test(value);

export function nomeDaCor(hex: string) {
  return CORES_MALHA.find((cor) => cor.hex.toLowerCase() === hex.toLowerCase())?.nome ?? hex.toUpperCase();
}

// Things that always hold, whatever the customer asks: what the print shop needs and what the brand can't print.
const REGRAS_FIXAS = [
  "Entregue SOMENTE a arte da estampa, centralizada, sem camiseta, sem manequim, sem pessoa vestindo, sem mockup e sem moldura.",
  "Fundo liso e uniforme, sem textura, sem sombra e sem degradê, na cor exata da malha, para a arte poder ser recortada para a impressão.",
  "NÃO escreva palavras, letras ou assinaturas na arte: o texto da estampa é aplicado depois, com a fonte escolhida pelo cliente. Números e símbolos (naipes, estrelas etc.) só se fizerem parte do pedido.",
  "Traço limpo e bordas bem definidas, com poucas cores chapadas, próprias para serigrafia/DTF em camiseta.",
  "Não use logotipos de marcas, personagens protegidos, escudos de times nem rostos de pessoas famosas.",
];

// The image prompt, in Portuguese like the rest of the site's prompts. Shown in full to the customer before generating.
export function planEstampa(ficha: Ficha, painel: Painel, extras: { referencias: number; estampaCasa: boolean }) {
  const malha = painel.paleta[0];
  const cores = (ficha.cores.length ? ficha.cores : painel.paleta.slice(1)).filter((cor) => cor.toLowerCase() !== malha.toLowerCase());
  const casa = painel.estampaCasa ? estampaCasaDe(painel.estampaCasa) : undefined;

  const imagens: string[] = [];
  if (extras.estampaCasa && casa) imagens.push(`Imagem ${imagens.length + 1}: estampa da casa MERANNO "${casa.nome}" (${casa.descricao}). Use-a como ponto de partida de estilo e traço.`);
  if (ficha.usarReferencias) for (let i = 0; i < extras.referencias; i++) imagens.push(`Imagem ${imagens.length + 1}: referência enviada pelo cliente. Inspire-se no clima, nos elementos e nas cores, sem copiar a imagem nem nenhuma marca que apareça nela.`);

  const linhas = [
    "Crie a arte de uma estampa para as COSTAS de uma camiseta da marca MERANNO (moda brasileira, estética elegante e autoral).",
    "",
    `Ideia: ${ficha.ideia || "estampa autoral MERANNO"}.`,
    ficha.elementos.length ? `Elementos: ${ficha.elementos.join("; ")}.` : null,
    ficha.estilo ? `Estilo: ${ficha.estilo}.` : null,
    ficha.composicao ? `Composição: ${ficha.composicao}.` : null,
    `Cor da malha (fundo): ${nomeDaCor(malha)} ${malha.toUpperCase()}.`,
    cores.length ? `Cores da arte: ${cores.map((cor) => `${nomeDaCor(cor)} ${cor.toUpperCase()}`).join(", ")}. Use somente essas cores, além da cor da malha.` : null,
    ficha.evitar.length ? `Evite: ${ficha.evitar.join("; ")}.` : null,
    ficha.texto ? `Deixe um espaço livre logo abaixo da arte para o texto "${ficha.texto}", que será aplicado depois.` : null,
    ...(imagens.length ? ["", ...imagens] : []),
    "",
    "Regras:",
    ...REGRAS_FIXAS.map((regra) => `- ${regra}`),
  ];
  return linhas.filter((linha) => linha !== null).join("\n").trim();
}

// What the chat model sees each turn, besides the conversation.
export function resumoPainel(painel: Painel, referencias: number) {
  const casa = painel.estampaCasa ? estampaCasaDe(painel.estampaCasa) : undefined;
  return [
    `Modelagem: ${MODELAGENS.find((m) => m.id === painel.modelagem)?.nome}.`,
    `Cor da malha: ${nomeDaCor(painel.paleta[0])} ${painel.paleta[0]}.`,
    `Cores da paleta para a estampa: ${painel.paleta.slice(1).map((cor) => `${nomeDaCor(cor)} ${cor}`).join(", ") || "nenhuma escolhida"}.`,
    `Frente: escrita ${escritaDe(painel.fonte)} na fonte ${fonteDe(painel.fonte).nome}, cor ${nomeDaCor(painel.corEscrita)} (fixa, não faz parte da criação).`,
    `Estampa da casa escolhida como base: ${casa ? `"${casa.nome}" (${casa.descricao})` : "nenhuma"}.`,
    `Referências enviadas pelo cliente: ${referencias}.`,
  ].join("\n");
}

export const SYSTEM_CHAT = `Você é o assistente de criação do Personalizador MERANNO, uma marca brasileira de camisetas com estética elegante e autoral ("Pra quem entende de exclusividade").

Seu trabalho: conversar com o cliente para montar a FICHA da estampa que vai nas COSTAS da camiseta. A frente é fixa (a escrita MERANNO, escolhida no painel) e não é assunto da conversa, a não ser para explicar isso.

Como conversar:
- Português do Brasil, tom caloroso e sofisticado, frases curtas. No máximo 3 frases por resposta.
- Faça UMA pergunta por vez, sobre o que mais falta na ficha (ideia, elementos, estilo, composição, cores, texto opcional).
- Use o que o cliente já escolheu no painel (cores, estampa da casa, referências). As cores da arte devem sair da paleta do painel; se ele pedir outra cor, diga para adicioná-la na Paleta.
- Quando houver imagens de referência na mensagem, descreva em poucas palavras o que você aproveitou delas e marque usar_referencias = true.
- Recuse com gentileza logotipos de marcas, personagens protegidos, escudos de times e rostos de famosos, e proponha uma alternativa autoral.
- Quando a ficha estiver completa o bastante para gerar (ao menos ideia, elementos e estilo), marque pronto = true e diga que ele pode revisar e criar a estampa.

Ficha: sempre devolva a ficha INTEIRA atualizada (não só o que mudou), mantendo o que já foi decidido. "texto" é um texto curto opcional que vai abaixo da arte (vazio se não houver). Cores em hexadecimal.

Sugestões: até 3 respostas curtas (máximo 45 caracteres) que o cliente pode tocar para responder à sua pergunta.

Esboço: quando a ficha mudar de forma visível, desenhe em "esboco" um SVG SIMPLES (viewBox="0 0 300 400", no máximo ~30 formas, sem texto, sem <script>, sem imagens externas, fundo transparente) que mostre a ideia geral: formas, posição e cores da arte. É só um rascunho para o cliente entender a direção, não a arte final. Se nada visual mudou, devolva "esboco" vazio.`;

export const FICHA_JSON_SCHEMA = {
  type: "object",
  properties: {
    resposta: { type: "string" },
    ficha: {
      type: "object",
      properties: {
        ideia: { type: "string" },
        elementos: { type: "array", items: { type: "string" } },
        estilo: { type: "string" },
        composicao: { type: "string" },
        cores: { type: "array", items: { type: "string" } },
        texto: { type: "string" },
        evitar: { type: "array", items: { type: "string" } },
        usar_referencias: { type: "boolean" },
      },
      required: ["ideia", "elementos", "estilo", "composicao", "cores", "texto", "evitar", "usar_referencias"],
      additionalProperties: false,
    },
    sugestoes: { type: "array", items: { type: "string" } },
    pronto: { type: "boolean" },
    esboco: { type: "string" },
  },
  required: ["resposta", "ficha", "sugestoes", "pronto", "esboco"],
  additionalProperties: false,
};

// Keeps the model's sketch to plain drawing: it is shown through <img>, where scripts never run, but stays small and inert anyway.
export function limparEsboco(svg: string) {
  const text = svg.trim();
  if (!text.startsWith("<svg") || !text.endsWith("</svg>") || text.length > 20_000) return "";
  if (/<script|<foreignObject|on[a-z]+\s*=|href\s*=|url\(\s*['"]?(?!#)/i.test(text)) return "";
  return text.includes("xmlns=") ? text : text.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
}
