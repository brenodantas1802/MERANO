import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The measurements profile was "Sobre mim" (under /conta, then /sobre-mim) and "Meu perfil" before joining
    // Merano Fit; the brand page was "A marca".
    return [
      { source: "/conta/sobre-mim", destination: "/meu-fit", permanent: true },
      { source: "/sobre-mim", destination: "/meu-fit", permanent: true },
      { source: "/meu-perfil", destination: "/meu-fit", permanent: true },
      { source: "/a-marca", destination: "/sobre-nos", permanent: true },
    ];
  },
};

export default nextConfig;
