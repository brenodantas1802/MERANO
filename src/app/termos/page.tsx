import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { EMPRESA, TERMOS_ATUALIZADOS_EM } from "@/lib/empresa";
import { POSTAGEM_DIAS_UTEIS } from "@/lib/entrega";
import { PRAZO_CANCELAMENTO_HORAS } from "@/lib/pedido-status";
import { PARCELAS_MAX } from "@/lib/products";

export const metadata: Metadata = { title: "Termos | MERANNO" };

// Rewritten on 2026-11-26 with the seller's data from the MEI certificate (Decreto 7.962/2013 and the Consumer Defence
// Code). Numbers that the site also uses (posting days, cancelling window, instalments) come from the same constants,
// so the Terms can't drift from what the site does.
export default function TermsPage() {
  return <ContentPage title="Termos" intro={`Estas são as condições das compras feitas em ${EMPRESA.site}. Ao fazer um pedido, você concorda com elas.`} sections={[
    { title: "Quem vende", text: `A loja ${EMPRESA.marca} é de ${EMPRESA.nome}, ${EMPRESA.tipo}, CNPJ ${EMPRESA.cnpj}, com endereço na ${EMPRESA.endereco}.` },
    { title: "Atendimento", text: `Pelo WhatsApp ${EMPRESA.whatsapp} ou pelo e-mail ${EMPRESA.email}. Respondemos em até 2 dias úteis, e dúvidas sobre pedidos, cancelamentos e desistências são resolvidas por esses mesmos canais.` },
    { title: "Pré-venda", text: "Enquanto durar a pré-venda, só entra no site quem está na lista dos grupos da Meranno: é preciso entrar com uma conta e informar o WhatsApp, que confere com a lista. O acesso é pessoal e não deve ser repassado." },
    { title: "Produtos e preços", text: "As fotos mostram as peças reais, mas a cor pode variar um pouco de uma tela para outra. O preço e as condições que valem são os mostrados no momento do pedido. As peças têm estoque limitado: se uma peça paga acabar, avisamos e você escolhe outra ou recebe o valor de volta, integralmente. Se o site mostrar por engano um preço claramente errado, avisamos e cancelamos o pedido com o valor devolvido por inteiro." },
    { title: "Pedido e pagamento", text: `O pedido é confirmado quando o pagamento é aprovado: no Pix, na hora; no cartão, depois da análise. O pagamento é feito por Pix ou cartão de crédito, à vista ou em até ${PARCELAS_MAX}x sem juros, na página segura do Asaas, nosso processador de pagamentos. A Meranno não recebe nem guarda os dados do cartão.` },
    { title: "Entrega", text: `Postamos o pedido em até ${POSTAGEM_DIAS_UTEIS} dias úteis depois da confirmação do pagamento, pelo frete que você escolheu. O valor do frete e a data prevista de chegada aparecem antes do pagamento, calculados pelo CEP. O código de rastreio fica na página do pedido. Se o pedido voltar por endereço incompleto ou por ninguém receber nas tentativas da transportadora, combinamos o reenvio com você, e o novo frete fica por sua conta.` },
    { title: "Cancelamento", text: `Nas primeiras ${PRAZO_CANCELAMENTO_HORAS} horas depois do pedido, e antes do envio, você mesmo pode cancelar na página do pedido: o valor volta sozinho para onde você pagou (no Pix, na hora; no cartão, como crédito na fatura, o que pode levar até duas faturas). Depois disso, fale com a gente pelo WhatsApp.` },
    { title: "Trocas, desistência e defeitos", text: "A Meranno não faz trocas de tamanho, cor ou modelo. Você pode desistir da compra em até 7 dias depois de receber a peça, como garante o Código de Defesa do Consumidor (art. 49), com o valor devolvido por inteiro, frete incluído. Peças com defeito a gente resolve. Como fazer está na página Trocas." },
    { title: "Camiseta personalizada", text: "No Personalizador, a estampa é criada com inteligência artificial a partir do que você escreve ou envia. Você só pode enviar imagens e textos que tem direito de usar, e não pode pedir conteúdo ofensivo, ilegal ou com marcas, personagens ou rostos de outras pessoas sem autorização. A equipe confere cada arte antes de produzir e pode recusá-la: nesse caso, o valor volta por inteiro. A peça é feita sob encomenda para você." },
    { title: "Provador virtual e Meranno Fit", text: "A prova do provador virtual é uma simulação feita por inteligência artificial e a recomendação de tamanho do Meranno Fit é uma sugestão pelas medidas informadas. As duas ajudam a escolher, mas não garantem o caimento exato. A tabela de medidas de cada peça vale como referência." },
    { title: "Marca e conteúdo", text: "O nome Meranno, a logo, as estampas, as fotos e os textos do site são da Meranno e não podem ser usados sem autorização." },
    { title: "Lei e foro", text: "Estes termos seguem as leis do Brasil, em especial o Código de Defesa do Consumidor. Qualquer questão pode ser levada ao foro da cidade onde você mora." },
    { title: "Atualizações", text: `Estes termos podem mudar. Vale sempre a versão publicada no dia do seu pedido. Última atualização: ${TERMOS_ATUALIZADOS_EM}.` },
  ]} />;
}
