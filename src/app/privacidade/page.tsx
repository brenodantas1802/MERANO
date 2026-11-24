import { ContentPage } from "@/components/content-page";

export default function PrivacyPage() {
  return <ContentPage title="Privacidade" sections={[
    { title: "O que coletamos", text: "Para receber um pedido, precisamos de nome, CPF, e-mail, celular e endereço de entrega. O CPF é exigido pelo processador de pagamento. Usamos esses dados apenas para atender, enviar e acompanhar a sua compra." },
    { title: "Como cuidamos", text: "Os dados são tratados com acesso restrito. O pagamento é feito na página segura do Asaas, nosso processador de pagamentos: os dados do cartão vão direto para ele, não passam pelo site da Meranno e não ficam guardados com a gente." },
    { title: "Com quem compartilhamos", text: "Só o necessário para concluir o pedido: o Asaas, para o pagamento; a SuperFrete e a transportadora escolhida (Correios ou Jadlog), que recebem nome, endereço e telefone para a entrega; e o Google, se você entrar com a conta Google. No provador virtual, a foto que você envia é processada por um serviço de inteligência artificial só para gerar a prova, e a Meranno não a guarda." },
    { title: "Cupom e novidades", text: "Se você deixar seu e-mail no aviso de cupom e marcar que aceita, guardamos esse e-mail para enviar o cupom e as novidades da Meranno. Você pode pedir para sair da lista a qualquer momento." },
    { title: "Avaliações", text: "Ao avaliar uma peça, publicamos o nome que você informar, a nota e o texto, depois de conferidos pela equipe." },
    { title: "Cookies de análise", text: "Só com a sua permissão, no aviso de cookies, usamos o Microsoft Clarity para ver de forma agregada onde as pessoas clicam e até onde rolam as páginas, para melhorar o site. Você pode recusar e o site funciona normalmente." },
    { title: "Seus direitos", text: "Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail contato.meranno@gmail.com." },
  ]} />;
}
