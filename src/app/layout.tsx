import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { FirstPurchasePopup } from "@/components/first-purchase-popup";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";

// Barlow Condensed is the closest open font to the DIN Condensed look the owners picked; its regular-width sibling
// carries the running text so long lines stay easy to read.
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display", display: "swap" });
const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "MERANO | Feito para quem entende exclusividade.",
  description: "Moda brasileira feita sob demanda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable}`}>
      <body><CartProvider>{children}<SiteFooter /><WhatsAppButton /><FirstPurchasePopup /></CartProvider></body>
    </html>
  );
}
