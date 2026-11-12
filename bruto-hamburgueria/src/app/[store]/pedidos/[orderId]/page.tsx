import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderTracking } from "@/components/store/order-tracking";
import { getDataSource } from "@/server/data";
import { loadStore } from "@/server/store-data";

interface PageProps {
  params: Promise<{ store: string; orderId: string }>;
  searchParams: Promise<{ novo?: string }>;
}

export const metadata: Metadata = { title: "Acompanhar pedido" };

export default async function OrderPage({ params, searchParams }: PageProps) {
  const [{ store: slug, orderId }, query] = await Promise.all([params, searchParams]);

  const store = await loadStore(slug);
  if (!store) notFound();

  // A consulta é por id. Em produção é um uuid, que não se adivinha nem se
  // enumera — é o que permite acompanhar um pedido sem obrigar cadastro.
  const order = await getDataSource().getOrder(store.id, orderId);
  if (!order) notFound();

  return <OrderTracking order={order} store={store} justPlaced={query.novo === "1"} />;
}
