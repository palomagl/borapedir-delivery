import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/server/supabase/client";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = { title: "Finalizar pedido" };

export default function Page() {
  return <>{!isSupabaseConfigured() && <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-line bg-brand-soft px-4 py-3 text-xs leading-relaxed text-brand">Pedido de demonstração. Não há cobrança nem envio para uma loja real.</p>}<CheckoutForm /></>;
}
