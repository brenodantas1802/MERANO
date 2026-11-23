import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { FirstPurchasePopup } from "@/components/first-purchase-popup";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ConsentimentoAnalise } from "@/components/consentimento-analise";
import { EntradaPreVenda } from "@/components/entrada-pre-venda";
import { SCRIPT_ENTRADA } from "@/lib/pre-venda";

// Barlow Condensed is the closest open font to the DIN Condensed look the owners picked; its regular-width sibling
// carries the running text so long lines stay easy to read.
// Only the weights the site uses (500 for titles and labels, 600 for the card indices): every weight is one more file.
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display", display: "swap" });
const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "MERANNO | Feito para quem entende de exclusividade.",
  description: "Moda brasileira para quem entende de exclusividade.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: SCRIPT_ENTRADA may add a class to <html> before React hydrates.
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{ __html: SCRIPT_ENTRADA }} /><EntradaPreVenda /><CartProvider>{children}<SiteFooter /><WhatsAppButton /><FirstPurchasePopup /><ConsentimentoAnalise /></CartProvider></body>
    </html>
  );
}
