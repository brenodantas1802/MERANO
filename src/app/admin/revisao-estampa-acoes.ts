"use server";
import { refresh } from "next/cache";
import { dono } from "./dono";

export async function revisarEstampa(id: string, decisao: "aprovada" | "recusada") {
  if (!/^[0-9a-f-]{36}$/.test(id) || !["aprovada", "recusada"].includes(decisao)) return { erro: "Revisão inválida." };
  const sessao = await dono();
  if (!sessao) return { erro: "Entre como responsável pela loja para revisar a arte." };
  const { data, error } = await sessao.admin.from("criacoes_estampa").select("ficha,status,arte_path").eq("id",id).maybeSingle();
  if (error || !data || data.status !== "pedida") return { erro: "A revisão é feita nas criações que já estão em um pedido." };
  const revisao = { ...data.ficha?.revisao, humana:decisao, responsavel:sessao.email, data:new Date().toISOString() };
  // Approving art does not mark payment, start production, or send files to anyone.
  const result = await sessao.admin.from("criacoes_estampa").update({ficha:{...data.ficha,revisao}}).eq("id",id).eq("status","pedida").eq("arte_path",data.arte_path).select("id");
  if(result.error||!result.data?.length)return {erro:"Não consegui salvar a revisão. Atualize e tente novamente."};
  refresh();return {ok:true};
}
