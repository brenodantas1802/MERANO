import { unstable_cache } from "next/cache";
import { createSecretClient } from "@/lib/supabase/publico";
import { definirPrecos, type TabelaPrecos } from "@/lib/products";

// The owners' price table (precos_produto, edited in /admin → "Preços"), read with the secret key. Server only.
export const TAG_PRECOS = "precos";

// Cached and tagged: saving a price expires it (revalidateTag in admin/precos-acoes), so every page shows the new price
// on the next visit. It is read again every 5 minutes anyway. A failed read throws, so it isn't cached.
const lerTabela = unstable_cache(async (): Promise<TabelaPrecos> => {
  const db = createSecretClient();
  if (!db) return {};
  const { data, error } = await db.from("precos_produto").select("produto_id, preco, preco_cheio");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((linha) => [linha.produto_id as string, { preco: Number(linha.preco), cheio: linha.preco_cheio == null ? null : Number(linha.preco_cheio) }]));
}, ["precos-produto"], { tags: [TAG_PRECOS], revalidate: 300 });

// Loads the table and makes it the one this server prices with (getProductPrice & co). Called at the top of every server
// page, route or action that shows or charges a price; if the database can't be read, the catalogue's prices hold.
export async function usarPrecos() {
  let tabela: TabelaPrecos = {};
  try {
    tabela = await lerTabela();
  } catch (erro) {
    console.error("usarPrecos failed:", erro instanceof Error ? erro.message : erro);
  }
  definirPrecos(tabela);
  return tabela;
}
