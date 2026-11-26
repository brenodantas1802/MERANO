import type { User } from "@supabase/supabase-js";
import { createSecretClient } from "@/lib/supabase/publico";

// What the payment page fills in for a signed-in customer, so a second purchase doesn't mean typing everything again
// (owners, 2026-11-26). It comes from the account's last order (name, e-mail, phone, CPF and address); with no order yet,
// from the account itself (e-mail, name and the WhatsApp from the pre-sale list). Server only, through the secret key,
// and only ever for the account that is signed in.
export type EnderecoSalvo = { cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
export type DadosSalvos = { email: string; nome: string; sobrenome: string; celular: string; cpf: string; endereco: EnderecoSalvo | null };

// "5511987654321" or "11987654321" -> "(11) 98765-4321".
const celularBonito = (valor: string) => {
  const digitos = valor.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  return digitos.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
};
const cepBonito = (valor: string) => valor.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
const separarNome = (nome: string) => {
  const [primeiro = "", ...resto] = nome.trim().split(/\s+/);
  return { nome: primeiro, sobrenome: resto.join(" ") };
};

type PedidoAntigo = { cliente: { nome?: string; email?: string; celular?: string; cpf?: string } | null; endereco: Partial<EnderecoSalvo> | null };

export async function dadosSalvos(user: User): Promise<DadosSalvos | null> {
  const admin = createSecretClient();
  if (!admin) return null;
  const email = user.email && user.email_confirmed_at ? user.email.trim().toLowerCase() : null;

  // The newest order of this account (or of its confirmed e-mail, for orders placed before signing in).
  const filtro = email ? `usuario_id.eq.${user.id},email.eq."${email.replace(/["\\]/g, "")}"` : `usuario_id.eq.${user.id}`;
  const { data: pedido } = await admin.from("pedidos").select("cliente, endereco").or(filtro).order("criado_em", { ascending: false }).limit(1).maybeSingle<PedidoAntigo>();
  if (pedido?.cliente) {
    const { cliente, endereco } = pedido;
    return {
      email: cliente.email ?? email ?? "",
      ...separarNome(cliente.nome ?? ""),
      celular: celularBonito(cliente.celular ?? ""),
      cpf: cliente.cpf ?? "",
      endereco: endereco?.cep ? { cep: cepBonito(endereco.cep), rua: endereco.rua ?? "", numero: endereco.numero ?? "", complemento: endereco.complemento ?? "", bairro: endereco.bairro ?? "", cidade: endereco.cidade ?? "", uf: endereco.uf ?? "" } : null,
    };
  }

  // No order yet: what the account and the pre-sale list already know.
  const { data: linha } = await admin.from("pre_venda_autorizados").select("telefone").eq("usuario_id", user.id).not("telefone", "is", null).limit(1).maybeSingle<{ telefone: string }>();
  const meta = user.user_metadata ?? {};
  const nomeConta = String(meta.full_name ?? meta.name ?? "");
  const telefone = linha?.telefone ?? (typeof meta.phone === "string" ? meta.phone : "");
  if (!email && !nomeConta && !telefone) return null;
  return { email: email ?? "", ...separarNome(nomeConta), celular: celularBonito(telefone), cpf: "", endereco: null };
}
