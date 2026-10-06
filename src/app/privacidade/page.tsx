import { ContentPage } from "@/components/content-page";

export default function PrivacyPage() {
  return <ContentPage title="Privacidade" sections={[
    { title: "O que coletamos", text: "Para receber um pedido, precisamos de nome, e-mail, telefone e endereço de entrega. Usamos esses dados apenas para atender, produzir e acompanhar sua compra." },
    { title: "Como cuidamos", text: "Os dados são tratados com acesso restrito e não armazenamos dados de cartão. Nesta fase, a confirmação do pedido é manual e qualquer pagamento futuro será processado por provedor certificado." },
    { title: "Seus direitos", text: "Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail equipe@merano.com." },
  ]} />;
}
