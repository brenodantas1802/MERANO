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
  { id: "colecao-01", name: "Summer Collection 01", tagline: "A primeira coleção da Meranno", image: "/imagens/merano-assets/recortes/arancia-v2-recorte-1000.webp" },
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
// What the shop sells: P, M and G since 2026-11-22, plus GG on every tee since 2026-11-26 (owners). The chart, the
// Meranno Fit, the try-on and the Personalizador show just these.
export const TAMANHOS_LOJA = ["P", "M", "G", "GG"] as const;
export const SIZE_CHART: SizeRow[] = REMIX_REGULAR.filter((row) => (TAMANHOS_LOJA as readonly string[]).includes(row.size));
export const TOLERANCIA_CM = 2;

// Composition of the Remix regular blank.
export const MATERIAL = "Camiseta regular unissex, 100% algodão penteado, malha de 180 g/m²";

// Prices. Since 2026-11-24 the owners set each tee's price in /admin → "Preços" (table precos_produto: the price charged
// and an optional crossed-out price). The server reads the table (lib/precos-servidor) and hands it to the browser in
// the root layout (<PrecosDoSite>); everything below reads it through getProductPrice / getPrecoCheio.
// These constants are only the fallback, used if the table can't be read. Since 2026-11-26 every tee is back at R$ 180
// with nothing crossed out (owners: "voltarem a ser 180 reais"; the pre-sale was R$ 160), so the top bar and the
// "preço de pré-venda" notes are gone; a lower PRECO_PRE_VENDA would bring them back.
export const PRECO_LANCAMENTO = 180;
export const PRECO_PRE_VENDA = PRECO_LANCAMENTO;
export const ID_PERSONALIZADA = "personalizada";

export type PrecoDefinido = { preco: number; cheio: number | null };
export type TabelaPrecos = Record<string, PrecoDefinido>;
let tabelaPrecos: TabelaPrecos = {};
// Replaces the price table (server: lib/precos-servidor usarPrecos; browser: <PrecosDoSite>).
export function definirPrecos(tabela: TabelaPrecos) {
  tabelaPrecos = tabela;
}
const padraoPersonalizada: PrecoDefinido = { preco: PRECO_PRE_VENDA, cheio: PRECO_LANCAMENTO };
const cheioValido = (definido: PrecoDefinido) => (definido.cheio && definido.cheio > definido.preco ? definido.cheio : null);
export const precoPersonalizada = () => (tabelaPrecos[ID_PERSONALIZADA] ?? padraoPersonalizada).preco;
export const cheioPersonalizada = () => cheioValido(tabelaPrecos[ID_PERSONALIZADA] ?? padraoPersonalizada);

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
    salePrice: PRECO_PRE_VENDA,
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
    salePrice: PRECO_PRE_VENDA,
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
    salePrice: PRECO_PRE_VENDA,
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
    description: "Laranjas e flores sobre o azul-marinho, com MERANNO e BRASIL nas costas e a assinatura discreta no peito.",
    price: PRECO_LANCAMENTO,
    salePrice: PRECO_PRE_VENDA,
    note: "Estampa Arancia",
    image: "/imagens/merano-assets/produtos/arancia-verso-v2-branco.png",
    gallery: ["/imagens/merano-assets/produtos/arancia-verso-v2-branco.png", "/imagens/merano-assets/produtos/arancia-frente.jpg"],
    views: { back: "/imagens/merano-assets/produtos/arancia-verso-v2-branco.png", front: "/imagens/merano-assets/produtos/arancia-frente.jpg" },
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
    salePrice: PRECO_PRE_VENDA,
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

// "R$ 160" for whole prices (the top bar and badges), "R$ 159,90" otherwise.
// A non-breaking space keeps "R$" and the number on the same line on narrow phones.
export const precoCurto = (price: number) => (Number.isInteger(price) ? `R$\u00a0${price}` : formatPrice(price));

// What the piece sells for: the owners' price, or the catalogue's when the table has none.
export function getProductPrice(product: Product) {
  return tabelaPrecos[product.id]?.preco ?? product.salePrice ?? product.price;
}

// The crossed-out price, only when it is above the selling price (null: show just the price).
export function getPrecoCheio(product: Product) {
  const definido = tabelaPrecos[product.id];
  const cheio = definido ? definido.cheio : product.salePrice ? product.price : null;
  return cheio && cheio > getProductPrice(product) ? cheio : null;
}

// The pre-sale offer for the top bar: one price for every tee (with the crossed-out one), "varios" when the tees have
// different special prices, or null when nothing is crossed out.
export function ofertaGeral(): { preco: number; cheio: number } | "varios" | null {
  const lista = products.map((product) => ({ preco: getProductPrice(product), cheio: getPrecoCheio(product) }));
  if (!lista.some((item) => item.cheio)) return null;
  const [primeiro] = lista;
  return primeiro.cheio && lista.every((item) => item.preco === primeiro.preco && item.cheio === primeiro.cheio) ? { preco: primeiro.preco, cheio: primeiro.cheio } : "varios";
}

// The catalogue piece behind a cart or order line (older lines without productId carry it in "<product>-<size>-…").
export function produtoDoItem(item: { id?: string; productId?: string | null }) {
  const { id = "" } = item;
  return (item.productId ? getProduct(item.productId) : undefined) ?? products.filter((product) => id === product.id || id.startsWith(`${product.id}-`)).sort((a, b) => b.id.length - a.id.length)[0];
}

// The pre-sale discount as a whole percentage ("11%" for R$ 160 instead of R$ 180), as the owners want it shown
// (2026-11-24: a percentage, not "R$ 20 a menos").
export const percentualDesconto = (cheio: number, preco: number) => Math.round((1 - preco / cheio) * 100);

// The same for a cart: what its crossed-out pieces save, over what they would cost (the personalised tee included).
// 0 when nothing in it has a crossed-out price.
export function percentualPreVenda(itens: readonly { id: string; productId?: string; criacaoId?: string; price: number; quantity: number }[]) {
  let cheios = 0;
  let pagos = 0;
  for (const item of itens) {
    const produto = item.criacaoId ? undefined : produtoDoItem(item);
    const cheio = item.criacaoId ? cheioPersonalizada() : produto ? getPrecoCheio(produto) : null;
    if (!cheio || cheio <= item.price) continue;
    cheios += cheio * item.quantity;
    pagos += item.price * item.quantity;
  }
  return cheios ? percentualDesconto(cheios, pagos) : 0;
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
