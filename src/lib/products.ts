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
};

export type Collection = { id: string; name: string; tagline: string; image: string };

export const collections: Collection[] = [
  { id: "colecao-01", name: "Coleção 01", tagline: "Sol, terra e a primeira coleção da Merano", image: "/imagens/merano-assets/banner-paisagem.jpg" },
];

const GENERIC_FRONT = "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg";

export const products: Product[] = [
  {
    id: "who-cares-preto",
    name: "Who cares · Preto",
    description: "A mesma atitude do Who Cares, em preto — pra quem também não liga pro relógio depois que o sol se põe.",
    price: 189,
    note: "Estampa Who Cares · Preto",
    image: "/imagens/merano-assets/produtos/who-cares-preto-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/who-cares-preto-verso.jpg", "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg", "/imagens/merano-assets/produtos/preta-vermelha-lado-esquerdo.jpg", "/imagens/merano-assets/produtos/preta-vermelha-lado-direito.jpg"],
    views: { back: "/imagens/merano-assets/produtos/who-cares-preto-verso.jpg", front: "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg", left: "/imagens/merano-assets/produtos/preta-vermelha-lado-esquerdo.jpg", right: "/imagens/merano-assets/produtos/preta-vermelha-lado-direito.jpg" },
    category: "Camisetas",
    tags: ["frase", "relogio", "urbano", "preto"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 8,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Preto"],
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
    colors: ["Preto"],
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
    colors: ["Azul marinho"],
  },
  {
    id: "rastro-no-lago",
    name: "Rastro no lago",
    description: "Um barco corta a água e deixa só o rastro — a sensação de estar exatamente onde devia.",
    price: 189,
    note: "Estampa Rastro no Lago",
    image: "/imagens/merano-assets/camiseta barco só verso.jpeg",
    gallery: ["/imagens/merano-assets/camiseta barco só verso.jpeg", "/imagens/merano-assets/produtos/barco-frente.jpg", "/imagens/merano-assets/produtos/barco-lado-esquerdo.jpg", "/imagens/merano-assets/produtos/barco-lado-direito.jpg"],
    views: { back: "/imagens/merano-assets/camiseta barco só verso.jpeg", front: "/imagens/merano-assets/produtos/barco-frente.jpg", left: "/imagens/merano-assets/produtos/barco-lado-esquerdo.jpg", right: "/imagens/merano-assets/produtos/barco-lado-direito.jpg" },
    category: "Camisetas",
    tags: ["agua", "barco", "paisagem", "pintura"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 6,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "match-point",
    name: "Match point",
    description: "Uma quadra, um ponto decisivo — a estampa para quem joga pra vencer.",
    price: 189,
    note: "Estampa Match Point",
    image: "/imagens/merano-assets/produtos/match-point-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/match-point-verso.jpg", "/imagens/merano-assets/produtos/tenis-frente.jpg", "/imagens/merano-assets/produtos/tenis-lado-esquerdo.jpg", "/imagens/merano-assets/produtos/tenis-lado-direito.jpg"],
    views: { back: "/imagens/merano-assets/produtos/match-point-verso.jpg", front: "/imagens/merano-assets/produtos/tenis-frente.jpg", left: "/imagens/merano-assets/produtos/tenis-lado-esquerdo.jpg", right: "/imagens/merano-assets/produtos/tenis-lado-direito.jpg" },
    category: "Camisetas",
    tags: ["esporte", "tenis", "pintura"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 8,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "mamao",
    name: "Mamão",
    description: "Um bodegão tropical: mamão, veleiro ao longe e a certeza de que dias bons levam tempo.",
    price: 189,
    note: "Estampa Mamão",
    image: "/imagens/merano-assets/camieta mamao verso.jpeg",
    gallery: ["/imagens/merano-assets/camieta mamao verso.jpeg", "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg"],
    views: { back: "/imagens/merano-assets/camieta mamao verso.jpeg", front: GENERIC_FRONT },
    category: "Camisetas",
    tags: ["fruta", "tropical", "barco", "verao"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 10,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "terraco-ao-mar",
    name: "Terraço ao mar",
    description: "Uma mesa posta, vinho aberto e o mar logo ali — o convite pra ficar mais um pouco.",
    price: 189,
    note: "Estampa Terraço ao Mar",
    image: "/imagens/merano-assets/produtos/terraco-ao-mar-verso.jpg",
    gallery: ["/imagens/merano-assets/produtos/terraco-ao-mar-verso.jpg", "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg"],
    views: { back: "/imagens/merano-assets/produtos/terraco-ao-mar-verso.jpg", front: GENERIC_FRONT },
    category: "Camisetas",
    tags: ["mar", "vinho", "paisagem", "verao"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 7,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "who-cares",
    name: "Who cares",
    description: "\"Who cares, I'm already late\" — um relógio rachado e a liberdade de não correr atrás do tempo.",
    price: 189,
    note: "Estampa Who Cares",
    image: "/imagens/merano-assets/camiseta who cares verso.jpeg",
    gallery: ["/imagens/merano-assets/camiseta who cares verso.jpeg", "/imagens/merano-assets/produtos/who-cares-frente.jpg", "/imagens/merano-assets/produtos/who-cares-lado-esquerdo.jpg", "/imagens/merano-assets/produtos/who-cares-lado-direito.jpg"],
    views: { back: "/imagens/merano-assets/camiseta who cares verso.jpeg", front: "/imagens/merano-assets/produtos/who-cares-frente.jpg", left: "/imagens/merano-assets/produtos/who-cares-lado-esquerdo.jpg", right: "/imagens/merano-assets/produtos/who-cares-lado-direito.jpg" },
    category: "Camisetas",
    tags: ["frase", "relogio", "urbano"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 11,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "disco",
    name: "Disco",
    description: "\"Music for a slower world\" — um disco girando e a trilha sonora certa pra desacelerar.",
    price: 189,
    note: "Estampa Disco",
    image: "/imagens/merano-assets/camisite verso disco.jpeg",
    gallery: ["/imagens/merano-assets/camisite verso disco.jpeg", "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg"],
    views: { back: "/imagens/merano-assets/camisite verso disco.jpeg", front: "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg" },
    category: "Camisetas",
    tags: ["musica", "frase", "urbano", "preto"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 6,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Preto"],
  },
  {
    id: "match-point-mini",
    name: "Match point · Mini",
    description: "A mesma quadra, num recorte mais discreto — pra quem prefere o jogo sutil.",
    price: 189,
    note: "Estampa Match Point · Mini",
    image: "/imagens/merano-assets/estampa menor camiseta verso tenis.jpeg",
    gallery: ["/imagens/merano-assets/estampa menor camiseta verso tenis.jpeg", "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg"],
    views: { back: "/imagens/merano-assets/estampa menor camiseta verso tenis.jpeg", front: GENERIC_FRONT },
    category: "Camisetas",
    tags: ["esporte", "tenis", "minimal"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 7,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "mares-tranquilos",
    name: "Mares tranquilos",
    description: "Um barco simples, um mar em silêncio — pela simplicidade das boas coisas.",
    price: 189,
    note: "Estampa Mares Tranquilos",
    image: "/imagens/merano-assets/camiseta little verso.jpeg",
    gallery: ["/imagens/merano-assets/camiseta little verso.jpeg", "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg"],
    views: { back: "/imagens/merano-assets/camiseta little verso.jpeg", front: GENERIC_FRONT },
    category: "Camisetas",
    tags: ["mar", "barco", "paisagem", "minimal"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 9,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
  {
    id: "cafe",
    name: "Café",
    description: "Boas conversas, melhores dias — um café de esquina que virou estampa e ponto de encontro.",
    price: 189,
    note: "Estampa Café",
    image: "/imagens/merano-assets/camiseta verso café.jpeg",
    gallery: ["/imagens/merano-assets/camiseta verso café.jpeg", "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg"],
    views: { back: "/imagens/merano-assets/camiseta verso café.jpeg", front: GENERIC_FRONT },
    category: "Camisetas",
    tags: ["cafe", "cidade", "encontro", "minimal"],
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 9,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural"],
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
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
