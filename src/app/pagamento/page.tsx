import type { Metadata } from "next";
import { pagamentoOnline } from "@/lib/mercado-pago";
import { Pagamento } from "./pagamento-cliente";

export const metadata: Metadata = { title: "Pagamento | MERANNO", robots: { index: false, follow: false } };

// Read on every request, so connecting Mercado Pago (MERCADOPAGO_ACCESS_TOKEN + redeploy) switches the page over.
export const dynamic = "force-dynamic";

export default function PaymentPage() {
  return <Pagamento online={pagamentoOnline()} />;
}
