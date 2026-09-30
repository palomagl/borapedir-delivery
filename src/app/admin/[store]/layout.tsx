import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { awaitingAction } from "@/domain/stats";
import { getDataSource } from "@/server/data";
import { loadStore } from "@/server/store-data";

export const metadata: Metadata = {
  title: { default: "Administração", template: "%s · Admin" },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const orders = await getDataSource().listOrders(store.id);

  return (
    <div
      className="min-h-dvh bg-paper-sunken"
      style={
        {
          "--store-brand": store.theme.brand,
          "--store-brand-contrast": store.theme.brandContrast,
        } as React.CSSProperties
      }
    >
      <AdminNav
        storeSlug={store.slug}
        storeName={store.name}
        awaitingCount={awaitingAction(orders).length}
      />
      <main className="lg:pl-56">{children}</main>
    </div>
  );
}
