import type { NextConfig } from "next";

// Security headers on every response (owners, 2026-11-26, after the security review). The site may be framed only by
// itself: /personalizar-estampa shows the Personalizador (/personalizador/index.html) in an iframe of the same site,
// and nobody else can put the store inside their page to trick a click (clickjacking). No script policy yet: a strict
// CSP needs testing with the Personalizador, the try-on and Clarity first. Strict-Transport-Security comes from Vercel.
const SEGURANCA = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site never asks for the camera (photos come from a file picker), the microphone or the location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SEGURANCA }];
  },
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
