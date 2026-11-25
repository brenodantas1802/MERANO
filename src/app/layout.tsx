import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { PrecosDoSite } from "@/components/precos-do-site";
import { usarPrecos } from "@/lib/precos-servidor";
import { FirstPurchasePopupTardio } from "@/components/first-purchase-popup-tardio";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ConsentimentoAnalise } from "@/components/consentimento-analise";
import { EntradaPreVenda } from "@/components/entrada-pre-venda";
import { SCRIPT_ENTRADA } from "@/lib/pre-venda";
import { SCRIPT_TEMA, TEMA_PADRAO } from "@/lib/tema";

// Barlow Condensed is the closest open font to the DIN Condensed look the owners picked; its regular-width sibling
// carries the running text so long lines stay easy to read.
// Only the weights the site uses (500 for titles and labels, 600 for the card indices): every weight is one more file.
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display", display: "swap" });
const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "MERANNO | Feito para quem entende de exclusividade.",
  description: "Moda brasileira para quem entende de exclusividade.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The owners' prices (/admin, "Preços"), cached; handed to the browser before the cart and the pages read them.
  const precos = await usarPrecos();
  return (
    // suppressHydrationWarning: SCRIPT_TEMA and SCRIPT_ENTRADA may change <html> before React hydrates.
    <html lang="pt-BR" data-tema={TEMA_PADRAO} data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA + SCRIPT_ENTRADA }} /><EntradaPreVenda /><PrecosDoSite precos={precos}><CartProvider>{children}<SiteFooter /><WhatsAppButton /><FirstPurchasePopupTardio /><ConsentimentoAnalise /></CartProvider></PrecosDoSite></body>
    </html>
  );
}
