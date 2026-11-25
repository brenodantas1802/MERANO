import { ContentPage } from "@/components/content-page";

// Updated 2026-11-24 to what the shop does now (Asaas, SuperFrete, no exchanges). The full rewrite with the company's
// name, CNPJ and address is still to come (PENDENCIAS: dados da empresa, Privacidade e Termos).
export default function TermsPage() {
  return <ContentPage title="Termos" intro="Ao comprar na Meranno, você concorda com as condições abaixo." sections={[
    { title: "Pedidos", text: "O pedido é confirmado quando o pagamento é aprovado: no Pix, na hora; no cartão, depois da análise do processador. Ele é despachado em seguida, no prazo informado na página do produto e no pagamento." },
    { title: "Pagamento", text: "Pix ou cartão de crédito, à vista ou em até 3x sem juros, na página segura do Asaas. A Meranno não recebe nem guarda os dados do cartão." },
    { title: "Frete", text: "O frete é calculado pelo CEP de entrega e aparece, com o prazo, antes do pagamento. O código de rastreio fica na página do pedido." },
    { title: "Trocas e desistência", text: "A Meranno não faz trocas de tamanho, cor ou modelo. A desistência em até 7 dias depois de receber a peça e as peças com defeito seguem o Código de Defesa do Consumidor, como explicado na página Trocas." },
    { title: "Cancelamento", text: "Nas primeiras 24 horas depois do pedido, e antes do envio, você mesmo pode cancelar na página do pedido: o valor volta sozinho para onde você pagou (no Pix, na hora; no cartão, como crédito na fatura, que pode levar até duas faturas). Depois disso, fale com a gente pelo WhatsApp." },
  ]} />;
}
