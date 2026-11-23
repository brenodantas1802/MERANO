// Catalog shots of the garment by angle, used by the virtual try-on to match the customer's pose.
// "left"/"right" are the wearer's left/right side. `front` is absent when the catalog has no front shot.
export type ShirtViews = { front?: string; back: string; left?: string; right?: string };

export type Product = {
  id: string;
  name: string;
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
  { id: "colecao-01", name: "Summer Collection 01", tagline: "A primeira coleção da Meranno", image: "/imagens/merano-assets/recortes/verao-em-boa-companhia-1400.webp" },
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

// Prices (owners, 2026-11-22): the tee costs R$ 180; in the pre-sale it sells for R$ 160.
// While the pre-sale runs the tees show R$ 180 crossed out and sell for R$ 160; after it, drop `salePrice`.
export const PRECO_LANCAMENTO = 180;
export const PRECO_PRE_VENDA = 160;

export const products: Product[] = [
  {
    id: "coracao-preto",
    name: "Coração · Preto",
    description: "Um coração vermelho em aquarela, rabiscado com anotações à mão nas costas, e a assinatura Meranno discreta no peito.",
    price: PRECO_LANCAMENTO,
    salePrice: PRECO_PRE_VENDA,
    note: "Estampa Coração",
    image: "/imagens/merano-assets/produtos/coracao-preto-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/coracao-preto-verso.jpg", "/imagens/merano-assets/produtos/coracao-preto-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/coracao-preto-verso.jpg", front: "/imagens/merano-assets/produtos/coracao-preto-frente.jpg" },
    tags: ["coracao", "aquarela", "manuscrito", "preto"],
    category: "Camisetas",
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Envio para todo o Brasil, com prazo e valor calculados pelo CEP.",
    stock: 10,
    fits: [...TAMANHOS_LOJA],
    lancamento: true,
    colors: ["Preto"],
  },
  {
    id: "coracao-branco",
    name: "Coração · Branco",
    description: "O mesmo coração em aquarela, com as anotações em preto sobre a malha branca, e a assinatura Meranno no peito.",
    price: PRECO_LANCAMENTO,
    salePrice: PRECO_PRE_VENDA,
    note: "Estampa Coração",
    image: "/imagens/merano-assets/produtos/coracao-branco-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/coracao-branco-verso.jpg", "/imagens/merano-assets/produtos/coracao-branco-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/coracao-branco-verso.jpg", front: "/imagens/merano-assets/produtos/coracao-branco-frente.jpg" },
    tags: ["coracao", "aquarela", "manuscrito", "branco"],
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
    id: "va-tutto-bene",
    name: "Va tutto bene",
    description: "Um terraço com limoeiros sobre o mar, numa tarde sem pressa. Va tutto bene, un passo alla volta: tudo bem, um passo de cada vez.",
    price: PRECO_LANCAMENTO,
    salePrice: PRECO_PRE_VENDA,
    note: "Estampa Va tutto bene",
    image: "/imagens/merano-assets/produtos/va-tutto-bene-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/va-tutto-bene-verso.jpg", "/imagens/merano-assets/produtos/va-tutto-bene-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/va-tutto-bene-verso.jpg", front: "/imagens/merano-assets/produtos/va-tutto-bene-frente.jpg" },
    tags: ["mar", "limao", "verao", "italia", "branco"],
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
    id: "verao-em-boa-companhia",
    name: "Verão em boa companhia",
    description: "Laranjeira em flor, sol e boa comida — lugares simples, dias inesquecíveis.",
    price: PRECO_LANCAMENTO,
    salePrice: PRECO_PRE_VENDA,
    note: "Estampa Verão em Boa Companhia",
    image: "/imagens/merano-assets/produtos/verao-em-boa-companhia-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/verao-em-boa-companhia-verso.jpg"],
    views: { back: "/imagens/merano-assets/produtos/verao-em-boa-companhia-verso.jpg" },
    category: "Camisetas",
    tags: ["fruta", "botanico", "verao", "natureza"],
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
    id: "wine-not",
    name: "Wine not?",
    description: "Uma garrafa aberta e a melhor resposta para qualquer convite — por que não?",
    price: PRECO_LANCAMENTO,
    salePrice: PRECO_PRE_VENDA,
    note: "Estampa Wine Not?",
    image: "/imagens/merano-assets/produtos/wine-not-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/wine-not-verso.jpg", "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg"],
    views: { back: "/imagens/merano-assets/produtos/wine-not-verso.jpg", front: "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg" },
    category: "Camisetas",
    tags: ["frase", "vinho", "pintado-a-mao", "preto"],
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

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

// Pieces shown only in the try-on (not for sale yet): kept out of `products`, so the shop, search and cart never see them.
export const provadorOnly: Product[] = [
  {
    id: "why-not-you",
    name: "Why Not You? · Branco",
    description: "WHY NOT YOU? em preto, grande e inclinado, no alto das costas, e a assinatura Meranno pequena no peito.",
    price: PRECO_LANCAMENTO,
    note: "Prévia · só no provador",
    image: "/imagens/merano-assets/produtos/why-not-you-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/why-not-you-verso.jpg", "/imagens/merano-assets/produtos/why-not-you-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/why-not-you-verso.jpg", front: "/imagens/merano-assets/produtos/why-not-you-frente.jpg" },
    // Measured on the photos: the back lettering is ~85% of the torso width, right under the collar.
    printScale: {
      back: "A frase WHY NOT YOU? é GRANDE: ocupa cerca de 85% da largura das costas (quase de uma costura do ombro à outra) e fica no alto das costas, logo abaixo da gola, entre 18% e 25% do comprimento da camiseta. A altura das letras é cerca de 1/9 da largura do tronco. NÃO reduza a frase: mantenha exatamente essa largura e essa altura em relação ao corpo da pessoa.",
      front: "No peito, só a escrita Meranno pequena, do lado esquerdo de quem veste, na altura do peito (cerca de 30% do comprimento da camiseta, a partir da gola), com cerca de 18% da largura do tronco. Não aumente nem acrescente nada.",
    },
    tags: ["frase", "tipografia", "branco"],
    category: "Camisetas",
    collection: "colecao-01",
    material: MATERIAL,
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Em breve.",
    stock: 0,
    fits: [...TAMANHOS_LOJA],
    colors: ["Branco"],
  },
];
export const provadorProducts: Product[] = [...provadorOnly, ...products];
export function getProvadorProduct(id: string) {
  return provadorProducts.find((product) => product.id === id);
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
