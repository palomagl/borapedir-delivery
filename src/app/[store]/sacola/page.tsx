import type { Metadata } from "next";
import { CartPage } from "@/components/store/cart-page";

export const metadata: Metadata = { title: "Sua sacola" };

export default function Page() {
  return <CartPage />;
}
