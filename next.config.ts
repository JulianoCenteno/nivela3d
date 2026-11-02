import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inclui os PDFs privados na função que faz a entrega protegida.
  outputFileTracingIncludes: {
    "/api/conteudos/[code]": ["./private/materiais/**/*"],
  },
};

export default nextConfig;
