import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança.
 *
 * São a defesa que vale para qualquer site: impedir que a loja seja embutida
 * num iframe de terceiro (clickjacking), impedir que o navegador adivinhe o
 * tipo de um arquivo, e restringir de onde script, imagem e conexão podem vir.
 */
const securityHeaders = [
  // Nada de embutir a loja num iframe alheio para capturar clique.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // A loja não usa câmera, microfone nem localização. Negar é mais honesto
  // do que deixar em aberto.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // O Next injeta script inline para hidratação; 'unsafe-eval' só em dev,
      // onde o Turbopack precisa dele.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.supabase.co",
      "media-src 'self'",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      // Nenhum plugin, nenhum iframe, nenhum envio de formulário para fora.
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto vivem no Supabase Storage em produção.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // O selo de desenvolvimento cobre a barra de navegação inferior no celular.
  devIndicators: false,
  // Não anuncia a versão do framework em cada resposta.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
