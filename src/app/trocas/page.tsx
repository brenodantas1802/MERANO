import { ContentPage } from "@/components/content-page";

// No exchanges (owners' meeting, 2026-11-22). What the law guarantees to online buyers stays: 7 days to give up the
// purchase (Código de Defesa do Consumidor, art. 49) and defects (art. 26).
export default function ReturnsPage() { return <ContentPage title="Trocas" sections={[
  { title: "Não fazemos trocas", text: "A Meranno não troca peças por tamanho, cor ou modelo. Antes de comprar, confira a tabela de medidas na página do produto e use o Meranno Fit para descobrir o seu tamanho." },
  { title: "Desistência em até 7 dias", text: "Como em toda compra pela internet, você pode desistir da compra em até 7 dias depois de receber a peça (art. 49 do Código de Defesa do Consumidor). A peça precisa voltar sem uso, sem lavagem e com a etiqueta, e devolvemos o valor pago. Fale com a gente pelo WhatsApp antes de enviar." },
  { title: "Peça com defeito", text: "Se a peça chegar com defeito, fale com a gente pelo WhatsApp em até 30 dias depois do recebimento, com fotos. Resolvemos com conserto, outra peça igual ou devolução do valor." },
]}/>; }
