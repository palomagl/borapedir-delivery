import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getDataSource } from "@/server/data";
import { loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProduct({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const categories = await getDataSource().getCategories(store.id);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Novo produto" description="Ele entra no fim da categoria escolhida." />
      <div className="mt-6">
        <ProductForm storeSlug={store.slug} categories={categories} />
      </div>
    </div>
  );
}
