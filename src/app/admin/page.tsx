import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { donosFixos, ehAdmin } from "@/lib/admins";
import { createSecretClient } from "@/lib/supabase/publico";
import { preVendaAtiva } from "@/lib/pre-venda";
import { CONFIG_PADRAO, resumoFinanceiro, type ConfigFinanceira, type Despesa } from "@/lib/financeiro";
import { AdminDashboard, type CriacaoAdmin, type CadastroCupom } from "./dashboard";
import type { Autorizado, PedidoAcesso } from "./lista-pre-venda";
import type { CupomAdmin } from "./cupons-admin";
import type { Pedido, StatusPedido } from "@/lib/pedidos";

const PAGOS: StatusPedido[] = ["pago", "em_separacao", "enviado", "entregue"];

// Every order, newest first (a pre-sale fits easily). Needs SUPABASE_SECRET_KEY.
async function carregarPedidos(): Promise<Pedido[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data } = await supabase.from("pedidos").select("*").order("criado_em", { ascending: false }).limit(1000);
  return (data ?? []) as Pedido[];
}

// The discount coupons, with how many paid orders used each one.
function cuponsComUsos(pedidos: Pedido[] | null, cupons: Omit<CupomAdmin, "usos">[]): CupomAdmin[] {
  const usos = new Map<string, number>();
  for (const pedido of pedidos ?? []) if (pedido.cupom && PAGOS.includes(pedido.status)) usos.set(pedido.cupom, (usos.get(pedido.cupom) ?? 0) + 1);
  return cupons.map((cupom) => ({ ...cupom, usos: usos.get(cupom.codigo) ?? 0 }));
}

async function carregarCuponsDesconto(): Promise<Omit<CupomAdmin, "usos">[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data } = await supabase.from("cupons").select("codigo, percentual, descricao, ativo, primeira_compra, boas_vindas, criado_em").order("criado_em", { ascending: false });
  return data ?? [];
}

// The pre-sale list, newest first. Needs SUPABASE_SECRET_KEY.
async function carregarLista(): Promise<Autorizado[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data } = await supabase.from("pre_venda_autorizados").select("id, nome, email, telefone, liberado_em, criado_em").order("criado_em", { ascending: false }).limit(2000);
  return data ?? [];
}

// Access requests waiting for an answer, plus the refused ones (they can still be let in).
async function carregarPedidosAcesso(): Promise<PedidoAcesso[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data } = await supabase.from("pre_venda_pedidos").select("id, nome, email, telefone, status, criado_em").in("status", ["pendente", "recusado"]).order("criado_em", { ascending: false }).limit(500);
  return (data ?? []) as PedidoAcesso[];
}

// The finance settings (one row) and the logged expenses, newest first. Numbers come back from Postgres as text.
async function carregarFinanceiro(): Promise<{ config: ConfigFinanceira; despesas: Despesa[] }> {
  const supabase = createSecretClient();
  if (!supabase) return { config: CONFIG_PADRAO, despesas: [] };
  const [{ data: linha }, { data: despesas }] = await Promise.all([
    supabase.from("financeiro_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("despesas").select("id, data, descricao, categoria, valor, criado_por").order("data", { ascending: false }).order("criado_em", { ascending: false }).limit(500),
  ]);
  const config = Object.fromEntries(Object.keys(CONFIG_PADRAO).map((chave) => [chave, linha?.[chave] != null ? Number(linha[chave]) : CONFIG_PADRAO[chave as keyof ConfigFinanceira]])) as ConfigFinanceira;
  return { config, despesas: (despesas ?? []).map((despesa) => ({ ...despesa, valor: Number(despesa.valor) })) as Despesa[] };
}

// Administrators made in the panel (besides the fixed owners).
async function carregarAdmins(): Promise<string[]> {
  const supabase = createSecretClient();
  if (!supabase) return [];
  const { data } = await supabase.from("administradores").select("email").order("criado_em");
  return (data ?? []).map((linha) => linha.email as string);
}

// E-mails left on the 10% coupon popup, newest first. Needs SUPABASE_SECRET_KEY, like the prints.
async function carregarCupons(): Promise<CadastroCupom[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data } = await supabase.from("cadastros_cupom").select("id, criado_em, email, cupom_enviado").order("criado_em", { ascending: false }).limit(200);
  return data ?? [];
}

// The latest custom prints, with short-lived links to their files (the bucket is private). Needs SUPABASE_SECRET_KEY.
async function carregarCriacoes(): Promise<CriacaoAdmin[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("criacoes_estampa").select("id, criada_em, status, tamanho, painel, ficha, arte_path, pedido, cliente").order("criada_em", { ascending: false }).limit(60);
  if (error || !data) return [];
  const caminhos = data.flatMap((row) => [row.arte_path, ...Object.values((row.ficha?.arquivos ?? {}) as Record<string, string>)]);
  const links = await supabase.storage.from("estampas").createSignedUrls(caminhos, 60 * 60);
  const porCaminho = new Map((links.data ?? []).map((link) => [link.path, link.signedUrl]));
  return data.map((row) => ({
    ...row,
    arte_url: porCaminho.get(row.arte_path) ?? null,
    arquivos_url: Object.fromEntries(Object.entries((row.ficha?.arquivos ?? {}) as Record<string, string>).map(([nome, caminho]) => [nome, porCaminho.get(caminho) ?? null])),
  }));
}

export const metadata: Metadata = { title: "Equipe · MERANNO", robots: { index: false, follow: false } };

// Owners only. The proxy already turns everyone else away; this checks again against Supabase itself, since the
// proxy is only a first gate.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/conta?next=/admin");
  const { data } = await supabase.auth.getClaims();
  if (!user.email || !user.email_confirmed_at || !(await ehAdmin(user.email, data?.claims.amr))) redirect("/conta");
  // The pre-sale link is shown with this site's own address (production, preview or local).
  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host") ?? "";
  const origem = `${cabecalhos.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  const [pedidos, descontos, criacoes, cadastros, lista, pedidosAcesso, { config, despesas }, admins] = await Promise.all([carregarPedidos(), carregarCuponsDesconto(), carregarCriacoes(), carregarCupons(), carregarLista(), carregarPedidosAcesso(), carregarFinanceiro(), carregarAdmins()]);
  const financeiro = { resumo: resumoFinanceiro(pedidos ?? [], config, despesas), config, despesas, disponivel: pedidos !== null };
  return <AdminDashboard email={user.email} pedidos={pedidos} descontos={descontos && cuponsComUsos(pedidos, descontos)} criacoes={criacoes} cupons={cadastros} lista={lista} pedidosAcesso={pedidosAcesso ?? []} origem={origem} cadeadoLigado={preVendaAtiva()} financeiro={financeiro} admins={{ fixos: donosFixos(), painel: admins, voce: user.email.toLowerCase() }} />;
}
