import type { Metadata } from "next";
import { ENTREGA_PRE_VENDA } from "@/lib/pedidos";
import { NOME_PROVEDOR, provedor } from "@/lib/pagamento";
import { Pagamento } from "./pagamento-cliente";

export const metadata: Metadata = { title: "Pagamento | MERANNO", robots: { index: false, follow: false } };

// Read on every request, so connecting Asaas (ASAAS_API_KEY + redeploy) switches the page over.
export const dynamic = "force-dynamic";

export default function PaymentPage() {
  const atual = provedor();
  return <Pagamento online={atual !== null} provedor={atual ? NOME_PROVEDOR[atual] : ""} entrega={ENTREGA_PRE_VENDA.longa} />;
}
