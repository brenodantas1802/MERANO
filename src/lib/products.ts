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
  { id: "colecao-01", name: "Coleção 01", tagline: "Sol, terra e a primeira coleção da Meranno", image: "/imagens/merano-assets/banner-paisagem.jpg" },
];

export const products: Product[] = [
  {
    id: "coracao-preto",
    name: "Coração · Preto",
    description: "Um coração vermelho em aquarela, rabiscado com anotações à mão nas costas, e a assinatura Meranno discreta no peito.",
    price: 189,
    note: "Estampa Coração",
    image: "/imagens/merano-assets/produtos/coracao-preto-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/coracao-preto-verso.jpg", "/imagens/merano-assets/produtos/coracao-preto-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/coracao-preto-verso.jpg", front: "/imagens/merano-assets/produtos/coracao-preto-frente.jpg" },
    tags: ["coracao", "aquarela", "manuscrito", "preto"],
    category: "Camisetas",
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 10,
    fits: ["PP", "P", "M", "G", "GG"],
    lancamento: true,
    colors: ["Preto"],
  },
  {
    id: "coracao-branco",
    name: "Coração · Branco",
    description: "O mesmo coração em aquarela, com as anotações em preto sobre a malha branca, e a assinatura Meranno no peito.",
    price: 189,
    note: "Estampa Coração",
    image: "/imagens/merano-assets/produtos/coracao-branco-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/coracao-branco-verso.jpg", "/imagens/merano-assets/produtos/coracao-branco-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/coracao-branco-verso.jpg", front: "/imagens/merano-assets/produtos/coracao-branco-frente.jpg" },
    tags: ["coracao", "aquarela", "manuscrito", "branco"],
    category: "Camisetas",
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 10,
    fits: ["PP", "P", "M", "G", "GG"],
    lancamento: true,
    colors: ["Branco"],
  },
  {
    id: "va-tutto-bene",
    name: "Va tutto bene",
    description: "Um terraço com limoeiros sobre o mar, numa tarde sem pressa. Va tutto bene, un passo alla volta: tudo bem, um passo de cada vez.",
    price: 189,
    note: "Estampa Va tutto bene",
    image: "/imagens/merano-assets/produtos/va-tutto-bene-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/va-tutto-bene-verso.jpg", "/imagens/merano-assets/produtos/va-tutto-bene-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/va-tutto-bene-verso.jpg", front: "/imagens/merano-assets/produtos/va-tutto-bene-frente.jpg" },
    tags: ["mar", "limao", "verao", "italia", "branco"],
    category: "Camisetas",
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 10,
    fits: ["PP", "P", "M", "G", "GG"],
    lancamento: true,
    colors: ["Branco"],
  },
  {
    id: "verao-em-boa-companhia",
    name: "Verão em boa companhia",
    description: "Laranjeira em flor, sol e boa comida — lugares simples, dias inesquecíveis.",
    price: 189,
    note: "Estampa Verão em Boa Companhia",
    image: "/imagens/merano-assets/produtos/verao-em-boa-companhia-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/verao-em-boa-companhia-verso.jpg"],
    views: { back: "/imagens/merano-assets/produtos/verao-em-boa-companhia-verso.jpg" },
    category: "Camisetas",
    tags: ["fruta", "botanico", "verao", "natureza"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 10,
    fits: ["PP", "P", "M", "G", "GG"],
    lancamento: true,
    colors: ["Azul marinho"],
  },
  {
    id: "wine-not",
    name: "Wine not?",
    description: "Uma garrafa aberta e a melhor resposta para qualquer convite — por que não?",
    price: 189,
    note: "Estampa Wine Not?",
    image: "/imagens/merano-assets/produtos/wine-not-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/wine-not-verso.jpg", "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg"],
    views: { back: "/imagens/merano-assets/produtos/wine-not-verso.jpg", front: "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg" },
    category: "Camisetas",
    tags: ["frase", "vinho", "pintado-a-mao", "preto"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 10,
    fits: ["PP", "P", "M", "G", "GG"],
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
    price: 189,
    note: "Prévia · só no provador",
    image: "/imagens/merano-assets/produtos/why-not-you-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/why-not-you-verso.jpg", "/imagens/merano-assets/produtos/why-not-you-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/why-not-you-verso.jpg", front: "/imagens/merano-assets/produtos/why-not-you-frente.jpg" },
    tags: ["frase", "tipografia", "branco"],
    category: "Camisetas",
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Em breve.",
    stock: 0,
    fits: ["PP", "P", "M", "G", "GG"],
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

export type SizeRow = { size: string; largura: number; comprimento: number; ombro: number };

export const SIZE_CHART: SizeRow[] = [
  { size: "PP", largura: 52, comprimento: 68, ombro: 46 },
  { size: "P", largura: 55, comprimento: 70, ombro: 48 },
  { size: "M", largura: 58, comprimento: 72, ombro: 50 },
  { size: "G", largura: 61, comprimento: 74, ombro: 52 },
  { size: "GG", largura: 64, comprimento: 76, ombro: 54 },
];

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
