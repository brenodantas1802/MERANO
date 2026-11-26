import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Entrega | MERANNO" };
export default function DeliveryPage() { return <ContentPage title="Entrega" sections={[{ title: "Prazo", text: "Postamos o pedido em até 2 dias úteis depois da confirmação do pagamento. O valor do frete e a data de chegada variam conforme o CEP e aparecem no carrinho e no pagamento." }, { title: "Acompanhamento", text: "Enviamos o código de rastreio por e-mail assim que o pedido for despachado." }, { title: "Trocas", text: "Não fazemos trocas. A desistência em até 7 dias e as peças com defeito estão explicadas na página Trocas." }]}/>; }
