import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { FirstPurchasePopup } from "@/components/first-purchase-popup";

export const metadata: Metadata = {
  title: "MERANO | Feito para quem entende exclusividade.",
  description: "Moda brasileira feita sob demanda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body><CartProvider>{children}<FirstPurchasePopup /></CartProvider></body>
    </html>
  );
}
