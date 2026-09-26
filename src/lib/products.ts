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
  { id: "colecao-01", name: "Coleção 01", tagline: "Sol, terra e a primeira coleção da Merano", image: "/imagens/merano-assets/banner-paisagem.png" },
];

const GENERIC_FRONT = "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg";

export const products: Product[] = [
  {
    id: "who-cares-preto",
    name: "Who cares · Preto",
    description: "A mesma atitude do Who Cares, em preto — pra quem também não liga pro relógio depois que o sol se põe.",
    price: 189,
    note: "Estampa Who Cares · Preto",
    image: "/imagens/merano-assets/camiseta preta e vermelha verso.jpeg",
    gallery: ["/imagens/merano-assets/camiseta preta e vermelha verso.jpeg", "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg", "/imagens/merano-assets/produtos/preta-vermelha-lado-esquerdo.jpg", "/imagens/merano-assets/produtos/preta-vermelha-lado-direito.jpg"],
    views: { back: "/imagens/merano-assets/camiseta preta e vermelha verso.jpeg", front: "/imagens/merano-assets/camiseta preta e vermelha frente.jpeg", left: "/imagens/merano-assets/produtos/preta-vermelha-lado-esquerdo.jpg", right: "/imagens/merano-assets/produtos/preta-vermelha-lado-direito.jpg" },
    category: "Camisetas",
    collection: "colecao-01",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 8,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Preto"],
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
    image: "/imagens/merano-assets/camiseta tenis verso.jpeg",
    gallery: ["/imagens/merano-assets/camiseta tenis verso.jpeg", "/imagens/merano-assets/produtos/tenis-frente.jpg", "/imagens/merano-assets/produtos/tenis-lado-esquerdo.jpg", "/imagens/merano-assets/produtos/tenis-lado-direito.jpg"],
    views: { back: "/imagens/merano-assets/camiseta tenis verso.jpeg", front: "/imagens/merano-assets/produtos/tenis-frente.jpg", left: "/imagens/merano-assets/produtos/tenis-lado-esquerdo.jpg", right: "/imagens/merano-assets/produtos/tenis-lado-direito.jpg" },
    category: "Camisetas",
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
    description: "Uma mesa posta, vinho aberto e o mar logo ali — o convite de \"mais dias assim, por favor\".",
    price: 189,
    note: "Estampa Terraço ao Mar",
    image: "/imagens/merano-assets/camiseta cadeirinha praia verso.jpeg",
    gallery: ["/imagens/merano-assets/camiseta cadeirinha praia verso.jpeg", "/imagens/merano-assets/camiseta GERAL MERANO FRENTE.jpeg"],
    views: { back: "/imagens/merano-assets/camiseta cadeirinha praia verso.jpeg", front: GENERIC_FRONT },
    category: "Camisetas",
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
