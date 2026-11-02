import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inclui os PDFs privados na função que faz a entrega protegida.
  outputFileTracingIncludes: {
    "/api/conteudos/[code]": ["./private/materiais/**/*"],
  },
  // Imagens de divulgação (checkout) podem ser lidas por outros sites.
  async headers() {
    return [{ source: "/dh/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] }];
  },
};

export default nextConfig;
