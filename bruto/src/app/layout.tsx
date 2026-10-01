import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

/** Corpo e interface: neutra, ampla faixa de pesos, ótima em corpo pequeno. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Display: condensada, caixa alta, com a presença que a marca pede. */
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BRUTO · Burger & Chapa",
    template: "%s · BRUTO",
  },
  description: "Carne. Chapa. Fogo. Sem desculpas. Peça online no BRUTO.",
};

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bebas.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
