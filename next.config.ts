import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The profile page was "Sobre mim", first under the account page and then at /sobre-mim.
    return [
      { source: "/conta/sobre-mim", destination: "/meu-perfil", permanent: true },
      { source: "/sobre-mim", destination: "/meu-perfil", permanent: true },
    ];
  },
};

export default nextConfig;
