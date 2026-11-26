import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { formatarDia, POSTAGEM_DIAS_UTEIS, PRIMEIRA_POSTAGEM } from "@/lib/entrega";

export const metadata: Metadata = { title: "Entrega | MERANNO" };
export default function DeliveryPage() { return <ContentPage title="Entrega" sections={[{ title: "Prazo", text: `Na pré-venda, as camisetas são produzidas depois que ela fecha, e a nossa estimativa é postar a partir de ${formatarDia(PRIMEIRA_POSTAGEM)}. Depois disso, postamos o pedido em até ${POSTAGEM_DIAS_UTEIS} dias úteis depois da confirmação do pagamento. O valor do frete e a data de chegada variam conforme o CEP e aparecem no carrinho e no pagamento.` }, { title: "Acompanhamento", text: "Enviamos o código de rastreio por e-mail assim que o pedido for despachado." }, { title: "Trocas", text: "Não fazemos trocas. A desistência em até 7 dias e as peças com defeito estão explicadas na página Trocas." }]}/>; }
