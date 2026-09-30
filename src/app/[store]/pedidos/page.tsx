import type { Metadata } from "next";
import { OrdersList } from "@/components/store/orders-list";

export const metadata: Metadata = { title: "Seus pedidos" };

export default function Page() {
  return <OrdersList />;
}
