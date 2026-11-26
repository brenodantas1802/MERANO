import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Perguntas frequentes | MERANNO" };
export default function FaqPage() { return <ContentPage title="FAQ" sections={[{ title: "Quando meu pedido chega?", text: "Depois da confirmação do pagamento, a gente separa e despacha o seu pedido. O prazo do transporte aparece no pagamento, calculado pelo seu CEP." }, { title: "Como escolho a modelagem?", text: "Na página do produto, escolha P, M ou G. As camisetas têm modelagem regular, de corte clássico: escolha o tamanho que você costuma usar. A tabela de medidas e o Meranno Fit ajudam." }, { title: "Posso trocar?", text: "Não fazemos trocas, por isso vale conferir a tabela de medidas e o Meranno Fit antes de comprar. Você ainda pode desistir da compra em até 7 dias depois de receber, e peças com defeito a gente resolve: está tudo na página Trocas." }]}/>; }
