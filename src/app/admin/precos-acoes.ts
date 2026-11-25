"use server";

import { refresh, revalidateTag } from "next/cache";
import { dono } from "./dono";
import { ID_PERSONALIZADA, products } from "@/lib/products";
import { TAG_PRECOS } from "@/lib/precos-servidor";

// The price of each tee, edited from the owners' panel (table precos_produto). Every action checks the owner again.
export type RespostaPreco = { tipo: "ok" | "erro"; texto: string } | null;

const IDS = new Set([...products.map((product) => product.id), ID_PERSONALIZADA]);
const reais = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

// The two fields of the form: the price charged and the optional crossed-out price, checked like the database does.
function lerPrecos(form: FormData): { erro: string } | { erro: null; preco: number; cheio: number | null } {
  const preco = Number(String(form.get("preco") ?? "").replace(",", "."));
  const textoCheio = String(form.get("cheio") ?? "").trim();
  const cheio = textoCheio ? Number(textoCheio.replace(",", ".")) : null;
  const centavos = (valor: number) => Math.abs(Math.round(valor * 100) - valor * 100) < 1e-6;
  if (!Number.isFinite(preco) || preco < 1 || preco > 9999 || !centavos(preco)) return { erro: "O preço vai de R$ 1 a R$ 9.999, com até 2 casas de centavos." };
  if (cheio !== null && (!Number.isFinite(cheio) || cheio > 9999 || !centavos(cheio))) return { erro: "O preço riscado precisa ser um valor até R$ 9.999." };
  if (cheio !== null && cheio <= preco) return { erro: "O preço riscado precisa ser maior que o preço. Deixe vazio para não riscar nada." };
  return { erro: null, preco, cheio };
}

async function gravar(ids: string[], form: FormData): Promise<RespostaPreco> {
  const lido = lerPrecos(form);
  if (lido.erro !== null) return { tipo: "erro", texto: lido.erro };
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só administradores, entrando com o Google, podem mudar preços." };
  const linhas = ids.map((id) => ({ produto_id: id, preco: lido.preco, preco_cheio: lido.cheio, atualizado_em: new Date().toISOString(), atualizado_por: sessao.email }));
  const { error } = await sessao.admin.from("precos_produto").upsert(linhas, { onConflict: "produto_id" });
  if (error) {
    console.error("salvar preço failed:", error.message);
    return { tipo: "erro", texto: "Não consegui salvar agora. Tente de novo." };
  }
  // Every page reads the table through this tag: the new price shows on the next visit, cart and checkout included.
  revalidateTag(TAG_PRECOS, { expire: 0 });
  refresh();
  return { tipo: "ok", texto: `${reais(lido.preco)}${lido.cheio ? ` (de ${reais(lido.cheio)})` : ""}` };
}

export async function salvarPreco(id: string, _anterior: RespostaPreco, form: FormData): Promise<RespostaPreco> {
  if (!IDS.has(id)) return { tipo: "erro", texto: "Peça não encontrada." };
  const resposta = await gravar([id], form);
  return resposta?.tipo === "ok" ? { tipo: "ok", texto: `Salvo: ${resposta.texto}.` } : resposta;
}

export async function salvarTodos(_anterior: RespostaPreco, form: FormData): Promise<RespostaPreco> {
  const resposta = await gravar([...IDS], form);
  return resposta?.tipo === "ok" ? { tipo: "ok", texto: `Todas as camisetas, a personalizada também: ${resposta.texto}.` } : resposta;
}
