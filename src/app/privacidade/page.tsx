import { ContentPage } from "@/components/content-page";

export default function PrivacyPage() {
  return <ContentPage title="Privacidade" sections={[
    { title: "O que coletamos", text: "Para receber um pedido, precisamos de nome, e-mail, telefone e endereço de entrega. Usamos esses dados apenas para atender, produzir e acompanhar sua compra." },
    { title: "Como cuidamos", text: "Os dados são tratados com acesso restrito e não armazenamos dados de cartão. Nesta fase, a confirmação do pedido é manual e qualquer pagamento futuro será processado por provedor certificado." },
    { title: "Cupom e novidades", text: "Se você deixar seu e-mail no aviso de cupom e marcar que aceita, guardamos esse e-mail para enviar o cupom e as novidades da Meranno. Você pode pedir para sair da lista a qualquer momento." },
    { title: "Avaliações", text: "Ao avaliar uma peça, publicamos o nome que você informar, a nota e o texto, depois de conferidos pela equipe." },
    { title: "Cookies de análise", text: "Só com a sua permissão, no aviso de cookies, usamos o Microsoft Clarity para ver de forma agregada onde as pessoas clicam e até onde rolam as páginas, para melhorar o site. Você pode recusar e o site funciona normalmente." },
    { title: "Seus direitos", text: "Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail contato.meranno@gmail.com." },
  ]} />;
}
