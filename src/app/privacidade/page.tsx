import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { EMPRESA, TERMOS_ATUALIZADOS_EM } from "@/lib/empresa";

export const metadata: Metadata = { title: "Privacidade | MERANNO" };

// Rewritten on 2026-11-26 for the LGPD (Lei 13.709/2018) from what the site really does: the database is Supabase in
// São Paulo (sa-east-1); the site runs on Vercel; payments on Asaas; shipping on SuperFrete; account e-mails go out
// through Gmail; the try-on and the Personalizador call image models through OpenRouter; the try-on photo isn't stored
// (api/generate keeps nothing); Meranno Fit measures stay in the browser (lib/body-profile); Clarity only loads after
// the visitor accepts (components/consentimento-analise). Keep this page in step when any of that changes.
export default function PrivacyPage() {
  return <ContentPage title="Privacidade" intro="Como a Meranno usa e protege os seus dados pessoais, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)." sections={[
    { title: "Quem cuida dos seus dados", text: `${EMPRESA.nome}, ${EMPRESA.tipo}, CNPJ ${EMPRESA.cnpj}, ${EMPRESA.endereco}, dona da loja ${EMPRESA.marca}, é a controladora dos dados tratados neste site. Para qualquer assunto de privacidade, escreva para ${EMPRESA.email}.` },
    { title: "Compras", text: "Para receber e entregar um pedido, usamos nome, CPF, e-mail, celular e endereço. O CPF é exigido pelo processador de pagamento. Esses dados servem para cobrar, enviar, acompanhar e dar suporte à compra, e para cumprir obrigações legais, como guardar o registro das vendas." },
    { title: "Conta e pré-venda", text: "Para criar a conta, usamos nome, e-mail, senha (guardada de forma cifrada) e o telefone, se você informar; ou o nome e o e-mail da sua conta Google, se você entrar com ela. Na pré-venda, conferimos o WhatsApp que você informa com a lista dos grupos da Meranno, que tem o nome e o número de cada pessoa convidada." },
    { title: "Cupom, novidades e avaliações", text: "Se você deixar seu e-mail no aviso de cupom e aceitar, ele é usado para enviar o cupom e as novidades da Meranno, até você pedir para sair. Ao avaliar uma peça, publicamos o nome que você informar, a nota e o texto, depois de conferidos pela equipe." },
    { title: "Provador virtual, Meranno Fit e Personalizador", text: "No provador virtual, a foto e as medidas que você envia vão para um serviço de inteligência artificial só para gerar a prova, e a Meranno não guarda a foto. As medidas do Meranno Fit ficam guardadas só no seu aparelho. No Personalizador, o texto e as imagens que você envia vão para o serviço de inteligência artificial que cria a estampa, e a arte final fica guardada para produzir a sua peça." },
    { title: "Com quem compartilhamos", text: "Só com quem precisa para o site funcionar e o pedido chegar: Asaas (pagamento); SuperFrete e a transportadora escolhida, Correios ou Jadlog (entrega: nome, endereço e telefone); Vercel (hospedagem do site); Supabase (banco de dados e contas, com os dados guardados em São Paulo); Google (entrar com Google e envio dos e-mails da conta); OpenRouter e os modelos de inteligência artificial que ele usa (provador e Personalizador). Não vendemos dados pessoais." },
    { title: "Dados fora do Brasil", text: "Alguns desses serviços ficam fora do Brasil, principalmente nos Estados Unidos. Os dados vão para lá só para executar o que você pediu (a compra, a conta, a prova ou a estampa), com serviços que seguem regras de proteção de dados, como permite o art. 33 da LGPD." },
    { title: "Por quanto tempo guardamos", text: "Os dados dos pedidos ficam guardados por 5 anos depois da compra, o prazo das leis de consumo e fiscais. A conta fica enquanto você quiser mantê-la. O e-mail das novidades, até você sair da lista. A lista da pré-venda, enquanto a pré-venda existir. A foto do provador não é guardada." },
    { title: "Cookies e dados no navegador", text: "O site guarda no seu navegador só o necessário para funcionar: o login, o acesso da pré-venda, o carrinho, os favoritos e o CEP digitado. Cookies de análise (Microsoft Clarity, que mostra de forma agregada onde as pessoas clicam e até onde rolam a página) só entram se você aceitar no aviso de cookies. Você pode recusar, e o site funciona normalmente." },
    { title: "Segurança", text: "Os dados ficam em serviços com acesso restrito e conexão cifrada. Só a equipe da Meranno acessa o painel de pedidos, e os dados do cartão não passam pelo nosso site." },
    { title: "Seus direitos", text: `Você pode pedir a confirmação de que tratamos seus dados, o acesso a eles, a correção, a exclusão, a portabilidade e a informação sobre com quem compartilhamos, e pode retirar um consentimento quando quiser. Peça pelo e-mail ${EMPRESA.email}: respondemos em até 15 dias. Se não ficar satisfeito, você pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).` },
    { title: "Menores de idade", text: "O site não é feito para crianças. Menores de 18 anos devem comprar com um responsável." },
    { title: "Atualizações", text: `Esta página pode mudar quando o site mudar. Última atualização: ${TERMOS_ATUALIZADOS_EM}.` },
  ]} />;
}
