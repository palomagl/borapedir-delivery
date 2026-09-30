import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = { title: "Finalizar pedido" };

export default function Page() {
  return <CheckoutForm />;
}
