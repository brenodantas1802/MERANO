import type { Metadata } from "next";
import { Fraunces, Jost, Josefin_Sans, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { FirstPurchasePopup } from "@/components/first-purchase-popup";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SmoothScroll } from "@/components/smooth-scroll";

const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-serif", display: "swap" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
// The MERANO wordmark in the header.
const wordmark = Josefin_Sans({ subsets: ["latin"], weight: "300", variable: "--font-wordmark", display: "swap" });

export const metadata: Metadata = {
  title: "MERANO | Feito para quem entende exclusividade.",
  description: "Moda brasileira feita sob demanda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable} ${script.variable} ${wordmark.variable}`}>
      <body><SmoothScroll /><CartProvider>{children}<SiteFooter /><WhatsAppButton /><FirstPurchasePopup /></CartProvider></body>
    </html>
  );
}
