import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Preserve print detail in catalog tiles (90) and product galleries/magnification (95).
    qualities: [75, 90, 95],
  },
  async redirects() {
    // The measurements profile was "Sobre mim" (under /conta, then /sobre-mim) and "Meu perfil" before joining
    // Merano Fit; the brand page was "A marca".
    return [
      { source: "/conta/sobre-mim", destination: "/meu-fit", permanent: true },
      { source: "/sobre-mim", destination: "/meu-fit", permanent: true },
      { source: "/meu-perfil", destination: "/meu-fit", permanent: true },
      { source: "/a-marca", destination: "/sobre-nos", permanent: true },
      // "Categorias" became "Coleções" (owners, 2026-11-23).
      { source: "/categorias", destination: "/colecoes", permanent: true },
      // The old manual-confirmation checkout (before the payment page); 2026-11-21.
      { source: "/checkout", destination: "/carrinho", permanent: true },
      // The pieces renamed by the owners on 2026-11-23 (IDS_ANTIGOS in src/lib/products.ts).
      { source: "/produto/coracao-preto", destination: "/produto/amore-black", permanent: true },
      { source: "/produto/coracao-branco", destination: "/produto/amore-white", permanent: true },
      { source: "/produto/va-tutto-bene", destination: "/produto/riviera", permanent: true },
      { source: "/produto/verao-em-boa-companhia", destination: "/produto/arancia", permanent: true },
      { source: "/produto/wine-not", destination: "/produto/why-not", permanent: true },
    ];
  },
};

export default nextConfig;
