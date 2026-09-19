export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  note: string;
  image: string;
  gallery: string[];
  category: string;
  material: string;
  care: string;
  delivery: string;
  stock: number;
  fits: string[];
  colors: string[];
};

export const products: Product[] = [
  {
    id: "frutos-da-floresta",
    name: "Frutos da floresta",
    description: "Uma composição de frutos tropicais para vestir a abundância da terra e o equilíbrio que nasce dela.",
    price: 189,
    salePrice: 169,
    note: "Estampa Frutos da Floresta · Nairu",
    image: "/imagens/camisa 1.jpeg",
    gallery: ["/imagens/camisa 1.jpeg", "/imagens/camisa 3.jpeg"],
    category: "Camisetas",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 12,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Natural", "Verde musgo", "Preto"],
  },
  {
    id: "entre-mar-e-terra",
    name: "Entre o mar e a terra",
    description: "Uma paisagem costeira, raízes que navegam e a memória de onde o mar encontra a terra.",
    price: 189,
    note: "Estampa Entre o Mar e a Terra · Nairu",
    image: "/imagens/camiseta 2.jpeg",
    gallery: ["/imagens/camiseta 2.jpeg", "/imagens/camisa 1.jpeg"],
    category: "Camisetas",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 8,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Areia", "Terracota", "Preto"],
  },
  {
    id: "essencial",
    name: "O essencial",
    description: "Frutos, folhas e origem em uma estampa que celebra o essencial: aquilo que nasce da terra.",
    price: 189,
    note: "Estampa Da Terra Nasce o Essencial · Nairu",
    image: "/imagens/camisa 3.jpeg",
    gallery: ["/imagens/camisa 3.jpeg", "/imagens/camiseta 2.jpeg"],
    category: "Camisetas",
    material: "100% algodão de toque macio",
    care: "Lavar do avesso em água fria. Secar à sombra.",
    delivery: "Produção em até 7 dias úteis + envio.",
    stock: 5,
    fits: ["PP", "P", "M", "G", "GG"],
    colors: ["Azul claro", "Natural", "Preto"],
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export function getProductPrice(product: Product) {
  return product.salePrice ?? product.price;
}
