import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
const font = Plus_Jakarta_Sans({ variable: "--font-roxo", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = { title: { default: "ROXO · Açaí do seu jeito", template: "%s · ROXO" }, description: "Monte seu açaí com seus acompanhamentos favoritos. Copos, barcas e combos personalizados para entrega ou retirada." };
export const viewport: Viewport = { themeColor: "#faf8f5", viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR" className={font.variable}><body className="min-h-dvh antialiased">{children}<Toaster /></body></html>; }
