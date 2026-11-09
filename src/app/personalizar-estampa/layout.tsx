import type { Metadata } from "next";
import { Bodoni_Moda, Cinzel, Cormorant, Cormorant_Garamond, Limelight, Manrope, Pinyon_Script, Space_Grotesk } from "next/font/google";

// The fixed MERANNO lettering styles for the front of the tee (see FONTES in lib/estampa.ts). Loaded only on this page.
const cormorant = Cormorant({ subsets: ["latin"], variable: "--font-cormorant", display: "swap" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-pinyon", display: "swap" });
const limelight = Limelight({ subsets: ["latin"], weight: "400", variable: "--font-limelight", display: "swap" });
// The prototype's own type: Cormorant Garamond for titles and the chat, Manrope for labels and buttons.
const garamond = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant-garamond", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Personalizador | MERANNO",
  description: "Monte a sua camiseta MERANNO: escolha modelagem, cores e a escrita da frente, e crie a estampa das costas conversando com a nossa IA.",
};

export default function PersonalizadorLayout({ children }: LayoutProps<"/personalizar-estampa">) {
  return <div className={`${cormorant.variable} ${bodoni.variable} ${cinzel.variable} ${pinyon.variable} ${limelight.variable} ${grotesk.variable} ${garamond.variable} ${manrope.variable}`}>{children}</div>;
}
