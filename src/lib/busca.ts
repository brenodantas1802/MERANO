import { getCollection, type Product } from "@/lib/products";

// Product search for the header and the Shop. Forgiving the way people type on a phone: no accents, any order, plural
// and feminine ("camisetas pretas" finds "Coração · Preto"), and the start of a word is enough ("cora").

const normalizar = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// "pretas" → "pret", "branco" → "branc", "camisetas" → "camiset": compares words without number and gender.
const raiz = (palavra: string) => {
  let base = palavra;
  if (base.length > 3 && base.endsWith("s")) base = base.slice(0, -1);
  if (base.length > 3 && /[aoe]$/.test(base)) base = base.slice(0, -1);
  return base;
};

// Words that only describe the kind of piece: every product is one, so they never narrow the search.
const GENERICAS = new Set(["camiset", "camis", "blus", "pec", "tee", "de", "da", "do", "com"]);

function palavrasDo(product: Product) {
  const texto = [product.name, product.note, product.category, product.tags.join(" "), product.colors.join(" "), getCollection(product.collection)?.name ?? ""].join(" ");
  return normalizar(texto).split(" ").filter(Boolean).map(raiz);
}

export function buscarProdutos(produtos: Product[], consulta: string) {
  const termos = normalizar(consulta).split(" ").filter(Boolean).map(raiz).filter((termo) => !GENERICAS.has(termo));
  if (!termos.length) return produtos;
  return produtos.filter((product) => {
    const palavras = palavrasDo(product);
    return termos.every((termo) => palavras.some((palavra) => palavra.startsWith(termo) || termo.startsWith(palavra) && palavra.length >= 4));
  });
}
