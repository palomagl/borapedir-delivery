import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto vivem no Supabase Storage em produção.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // O selo de desenvolvimento cobre a barra de navegação inferior no celular.
  devIndicators: false,
};

export default nextConfig;
