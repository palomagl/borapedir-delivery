import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getDataSource } from "@/server/data";
import { loadCatalog, loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProduct({
  params,
}: {
  params: Promise<{ store: string; productId: string }>;
}) {
  const { store: slug, productId } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const [categories, catalog] = await Promise.all([
    getDataSource().getCategories(store.id),
    loadCatalog(store.id),
  ]);

  const product = catalog
    .flatMap((section) => section.products)
    .find((candidate) => candidate.id === productId);

  if (!product) notFound();

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={product.name}
        description={
          product.optionGroups.length === 0
            ? "Sem grupos de opção"
            : product.optionGroups.length === 1
              ? "1 grupo de opção, preservado ao salvar"
              : `${product.optionGroups.length} grupos de opção, preservados ao salvar`
        }
      />
      <div className="mt-6">
        <ProductForm storeSlug={store.slug} categories={categories} product={product} />
      </div>
    </div>
  );
}
