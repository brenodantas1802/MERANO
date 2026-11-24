// Catalog shots of the garment by angle, used by the virtual try-on to match the customer's pose.
// "left"/"right" are the wearer's left/right side. `front` is absent when the catalog has no front shot.
export type ShirtViews = { front?: string; back: string; left?: string; right?: string };

export type Product = {
  id: string;
  name: string;
  // The same tee in other colours: listed apart in the shop, switched by colour on the product page (owners, 2026-11-24:
  // Amore Black and Amore White are one tee, shown as two because both did well in the validation).
  familia?: string;
  description: string;
  price: number;
  salePrice?: number;
  note: string;
  image: string;
  gallery: string[];
  views: ShirtViews;
  // Measured size and place of a print, for the try-on: the image model tends to shrink big prints.
  printScale?: { front?: string; back?: string };
  category: string;
  // Style/theme tags, used to suggest similar pieces.
  tags: string[];
  // Garment measurements per size when this piece differs from the house chart (SIZE_CHART).
  sizeChart?: SizeRow[];
  collection: string;
  material: string;
  care: string;
  delivery: string;
  stock: number;
  fits: string[];
  colors: string[];
  // Part of the launch the owners are featuring (home "Lançamento" shelf, badge on the card).
  lancamento?: boolean;
};

export type Collection = { id: string; name: string; tagline: string; image: string };

export const collections: Collection[] = [
  // Named by the owners on 2026-11-17. `image` is a shirt cutout (the old beach banner no longer fits the brand).
  { id: "colecao-01", name: "Summer Collection 01", tagline: "A primeira coleção da Meranno", image: "/imagens/merano-assets/recortes/arancia-1200.webp" },
];

export function getCollection(id: string) {
  return collections.find((collection) => collection.id === id);
}

// Flat measurements of the garment, in cm: `largura` is the chest (tórax, half the circumference), `barra` the hem
// width, `comprimento` the length, `ombro` seam to seam (left out when the supplier doesn't publish it).
export type SizeRow = { size: string; largura: number; comprimento: number; barra?: number; ombro?: number };

// The blank the collection is printed on: Remix On Demand's "Camiseta Algodão Unissex", the regular cut (owners,
// 2026-11-22: no more oversized). From remixondemand.com/catalogo, read on 2026-11-22; their chart has a 2 cm
// tolerance and doesn't give the shoulders.
export const REMIX_REGULAR: SizeRow[] = [
  { size: "P", largura: 50, barra: 51, comprimento: 70 },
  { size: "M", largura: 53, barra: 54, comprimento: 73 },
  { size: "G", largura: 56, barra: 57, comprimento: 76 },
  { size: "GG", largura: 59, barra: 60, comprimento: 79 },
  { size: "XXG", largura: 62, barra: 63, comprimento: 82 },
];
// What the shop sells (owners, 2026-11-22): P, M and G only. The chart, the Meranno Fit and the try-on show just these.
export const TAMANHOS_LOJA = ["P", "M", "G"] as const;
export const SIZE_CHART: SizeRow[] = REMIX_REGULAR.filter((row) => (TAMANHOS_LOJA as readonly string[]).includes(row.size));
export const TOLERANCIA_CM = 2;

// Composition of the Remix regular blank.
export const MATERIAL = "Camiseta regular unissex, 100% algodão penteado, malha de 180 g/m²";

// Prices (owners, 2026-11-24): every tee costs R$ 180, in the pre-sale too (no more R$ 160 with R$ 180 crossed out).
// `salePrice` is still supported for a future promotion.
export const PRECO_LANCAMENTO = 180;
export const PRECO_PRE_VENDA = PRECO_LANCAMENTO;

// The back print's size and place, measured on the official photo (2026-11-23): width as a share of the shirt's back,
// top and bottom as shares of its length from the collar down. Told to the try-on so the print keeps the photo's size
// and place on any body (measured on the results: the Amore heart came out at 0.60-0.74 of the back, photo 0.66).
const estampaCostas = (largura: number, de: number, ate: number) => `a arte ocupa cerca de ${largura}% da largura das costas da camiseta e vai de ${de}% a ${ate}% do comprimento dela, contando da gola para a barra, centralizada, exatamente como na foto de referência. É uma estampa GRANDE: não a diminua, não a afaste da gola e não deixe sobrar mais tecido liso em volta do que na foto.`;

// Photos: the owners' official ones of 2026-11-23 (regular cut, studio white), re-framed so every shirt sits at the same
// size and place (Amore White's back came later the same day).
export const products: Product[] = [
  {
    id: "amore-black",
    name: "Amore Black",
    description: "Um coração vermelho em aquarela, rabiscado com anotações à mão nas costas, e a assinatura Meranno discreta no peito.",
    price: PRECO_LANCAMENTO,
    note: "Estampa Amore",
    image: "/imagens/merano-assets/produtos/amore-black-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/amore-black-verso.jpg", "/imagens/merano-assets/produtos/amore-black-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/amore-black-verso.jpg", front: "/imagens/merano-assets/produtos/amore-black-frente.jpg" },
    printScale: { back: estampaCostas(80, 20, 66) },
    tags: ["amore", "amor", "coracao", "aquarela", "manuscrito", "preto", "black"],
    category: "Camisetas",
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Envio para todo o Brasil, com prazo e valor calculados pelo CEP.",
    stock: 10,
    fits: [...TAMANHOS_LOJA],
    lancamento: true,
    familia: "amore",
    colors: ["Preto"],
  },
  {
    id: "amore-white",
    name: "Amore White",
    description: "O mesmo coração em aquarela, com as anotações em preto sobre a malha branca, e a assinatura Meranno no peito.",
    price: PRECO_LANCAMENTO,
    note: "Estampa Amore",
    image: "/imagens/merano-assets/produtos/amore-white-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/amore-white-verso.jpg", "/imagens/merano-assets/produtos/amore-white-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/amore-white-verso.jpg", front: "/imagens/merano-assets/produtos/amore-white-frente.jpg" },
    printScale: { back: estampaCostas(73, 19, 62) },
    tags: ["amore", "amor", "coracao", "aquarela", "manuscrito", "branco", "white"],
    category: "Camisetas",
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Envio para todo o Brasil, com prazo e valor calculados pelo CEP.",
    stock: 10,
    fits: [...TAMANHOS_LOJA],
    lancamento: true,
    familia: "amore",
    colors: ["Branco"],
  },
  {
    id: "riviera",
    name: "Riviera",
    description: "Um terraço com limoeiros sobre o mar, numa tarde sem pressa. Va tutto bene, un passo alla volta: tudo bem, um passo de cada vez.",
    price: PRECO_LANCAMENTO,
    note: "Estampa Riviera · Va tutto bene",
    image: "/imagens/merano-assets/produtos/riviera-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/riviera-verso.jpg", "/imagens/merano-assets/produtos/riviera-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/riviera-verso.jpg", front: "/imagens/merano-assets/produtos/riviera-frente.jpg" },
    printScale: { back: estampaCostas(82, 17, 77) },
    tags: ["riviera", "mar", "limao", "cafe", "verao", "italia", "branco"],
    category: "Camisetas",
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Envio para todo o Brasil, com prazo e valor calculados pelo CEP.",
    stock: 10,
    fits: [...TAMANHOS_LOJA],
    lancamento: true,
    colors: ["Branco"],
  },
  {
    id: "arancia",
    name: "Arancia",
    description: "Laranjeira em flor num verão brasileiro, com MERANNO no peito. Em boa companhia.",
    price: PRECO_LANCAMENTO,
    note: "Estampa Arancia",
    image: "/imagens/merano-assets/produtos/arancia-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/arancia-verso.jpg", "/imagens/merano-assets/produtos/arancia-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/arancia-verso.jpg", front: "/imagens/merano-assets/produtos/arancia-frente.jpg" },
    printScale: { back: estampaCostas(67, 14, 76) },
    category: "Camisetas",
    tags: ["arancia", "laranja", "fruta", "botanico", "verao", "natureza", "azul"],
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Envio para todo o Brasil, com prazo e valor calculados pelo CEP.",
    stock: 10,
    fits: [...TAMANHOS_LOJA],
    lancamento: true,
    colors: ["Azul marinho"],
  },
  {
    id: "why-not",
    name: "Why not",
    description: "Uma garrafa aberta e a melhor resposta para qualquer convite — por que não?",
    price: PRECO_LANCAMENTO,
    note: "Estampa Why not",
    image: "/imagens/merano-assets/produtos/why-not-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/why-not-verso.jpg", "/imagens/merano-assets/produtos/why-not-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/why-not-verso.jpg", front: "/imagens/merano-assets/produtos/why-not-frente.jpg" },
    printScale: { back: estampaCostas(68, 19, 58) },
    category: "Camisetas",
    tags: ["frase", "vinho", "wine", "pintado-a-mao", "preto"],
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Envio para todo o Brasil, com prazo e valor calculados pelo CEP.",
    stock: 10,
    fits: [...TAMANHOS_LOJA],
    lancamento: true,
    colors: ["Preto"],
  },
];

// The pieces' old addresses (renamed by the owners on 2026-11-23): carts, favourites, orders and links from before still
// find their piece. The old /produto/... links also redirect (next.config.ts).
export const IDS_ANTIGOS: Record<string, string> = {
  "coracao-preto": "amore-black",
  "coracao-branco": "amore-white",
  "va-tutto-bene": "riviera",
  "verao-em-boa-companhia": "arancia",
  "wine-not": "why-not",
};

export function getProduct(id: string) {
  const atual = IDS_ANTIGOS[id] ?? id;
  return products.find((product) => product.id === atual);
}

// Pieces shown only in the try-on (not for sale yet): kept out of `products`, so the shop, search and cart never see them.
// Empty: Why Not You? was taken off the site on 2026-11-22 (a one-off piece for an influencer, not for sale).
export const provadorOnly: Product[] = [];
export const provadorProducts: Product[] = [...provadorOnly, ...products];
export function getProvadorProduct(id: string) {
  const atual = IDS_ANTIGOS[id] ?? id;
  return provadorProducts.find((product) => product.id === atual);
}

// Cart and order entries keep the photo path from the day they were added, and photos get renamed;
// prefer the catalog's current photo. Old entries without productId carry it in "<product>-<size>-<color>".
export function currentImage(item: { id?: string; productId?: string; image?: string }) {
  const { id = "" } = item;
  const product = (item.productId && getProduct(item.productId))
    || products.filter((candidate) => id === candidate.id || id.startsWith(`${candidate.id}-`)).sort((a, b) => b.id.length - a.id.length)[0];
  return product ? product.image : item.image;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export function getProductPrice(product: Product) {
  return product.salePrice ?? product.price;
}

// Card payments in up to 3 interest-free instalments (the Asaas checkout offers the same; lib/asaas.ts).
export const PARCELAS_MAX = 3;
export const parcelado = (price: number) => `${PARCELAS_MAX}x ${formatPrice(Math.floor((price / PARCELAS_MAX) * 100) / 100)} sem juros`;

export function getSizeChart(product: Product) {
  return product.sizeChart ?? SIZE_CHART;
}

// Pieces that share the most style tags (then colours) with the given ones, leaving out the ones given.
export function similarProducts(productIds: string[], limit = 3) {
  const owned = products.filter((product) => productIds.includes(product.id));
  if (!owned.length) return [];
  const tags = new Set(owned.flatMap((product) => product.tags));
  const colors = new Set(owned.flatMap((product) => product.colors));
  return products
    .filter((product) => !productIds.includes(product.id))
    .map((product) => ({ product, score: product.tags.filter((tag) => tags.has(tag)).length * 2 + product.colors.filter((color) => colors.has(color)).length + (owned.some((item) => item.category === product.category) ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}
