"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { CATEGORIAS_DESPESA } from "@/lib/financeiro";
import { dono } from "./dono";

// The finance panel's changes. Every action checks the owner again (see dono): a server action is a public endpoint.
export type RespostaFinanceiro = { tipo: "ok" | "erro"; texto: string } | null;

// "1.234,56", "1234,56" or "1234.56" → 1234.56
const numero = z.string().trim().transform((texto) => Number(texto.replace(/\s|R\$/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."))).pipe(z.number().finite().min(0).max(999999));
const inteiro = z.string().trim().transform(Number).pipe(z.number().int().min(0).max(100000));

const configSchema = z.object({
  custo_camiseta: numero,
  custo_acessorios: numero,
  taxa_pix_fixa: numero,
  taxa_cartao_percentual: numero.pipe(z.number().max(30)),
  taxa_cartao_fixa: numero,
  capital_inicial: numero,
  meta_pre_venda: inteiro,
  meta_lancamento: inteiro,
});

export async function salvarConfig(_anterior: RespostaFinanceiro, form: FormData): Promise<RespostaFinanceiro> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos, entrando com o Google, podem mudar os custos." };
  const parsed = configSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { tipo: "erro", texto: "Confira os valores: só números, com vírgula nos centavos." };
  const { error } = await sessao.admin.from("financeiro_config").upsert({ id: 1, ...parsed.data, atualizado_em: new Date().toISOString(), atualizado_por: sessao.email });
  if (error) return { tipo: "erro", texto: "Não consegui salvar agora. Tente de novo." };
  refresh();
  return { tipo: "ok", texto: "Custos salvos." };
}

const despesaSchema = z.object({
  descricao: z.string().trim().min(2, "Escreva o que foi a despesa.").max(120),
  categoria: z.enum(Object.keys(CATEGORIAS_DESPESA) as [keyof typeof CATEGORIAS_DESPESA, ...(keyof typeof CATEGORIAS_DESPESA)[]]),
  valor: numero.pipe(z.number().positive("Escreva o valor.")),
  data: z.iso.date("Confira a data."),
});

export async function adicionarDespesa(_anterior: RespostaFinanceiro, form: FormData): Promise<RespostaFinanceiro> {
  const sessao = await dono();
  if (!sessao) return { tipo: "erro", texto: "Só os donos, entrando com o Google, podem lançar despesas." };
  const parsed = despesaSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { tipo: "erro", texto: parsed.error.issues[0]?.message ?? "Confira os dados da despesa." };
  const { error } = await sessao.admin.from("despesas").insert({ ...parsed.data, criado_por: sessao.email });
  if (error) return { tipo: "erro", texto: "Não consegui salvar agora. Tente de novo." };
  refresh();
  return { tipo: "ok", texto: "Despesa lançada." };
}

export async function removerDespesa(id: string) {
  const sessao = await dono();
  if (!sessao || !/^[0-9a-f-]{36}$/.test(id)) return;
  await sessao.admin.from("despesas").delete().eq("id", id);
  refresh();
}
