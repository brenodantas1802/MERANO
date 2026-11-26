import type { Metadata } from "next";
import { dadosSalvos } from "@/lib/dados-salvos";
import { NOME_PROVEDOR, provedor } from "@/lib/pagamento";
import { createClient } from "@/lib/supabase/server";
import { Pagamento } from "./pagamento-cliente";

export const metadata: Metadata = { title: "Pagamento | MERANNO", robots: { index: false, follow: false } };

// Read on every request, so connecting Asaas (ASAAS_API_KEY + redeploy) switches the page over, and the signed-in
// customer's saved details (last order) come filled in.
export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const atual = provedor();
  const { data: { user } } = await (await createClient()).auth.getUser().catch(() => ({ data: { user: null } }));
  const salvos = user ? await dadosSalvos(user).catch(() => null) : null;
  return <Pagamento online={atual !== null} provedor={atual ? NOME_PROVEDOR[atual] : ""} salvos={salvos} />;
}
