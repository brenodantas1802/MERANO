import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // "Sobre mim" used to live under the account page.
    return [{ source: "/conta/sobre-mim", destination: "/sobre-mim", permanent: true }];
  },
};

export default nextConfig;
