import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityToggle } from "@/components/admin/availability-toggle";
import { PageHeader } from "@/components/admin/page-header";
import { ProductImage } from "@/components/store/product-image";
import { effectivePriceCents, hasPromo } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import { loadCatalog, loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProducts({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const catalog = await loadCatalog(store.id);
  const total = catalog.reduce((count, section) => count + section.products.length, 0);
  const unavailable = catalog
    .flatMap((section) => section.products)
    .filter((product) => !product.available).length;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Produtos"
        description={
          unavailable > 0
            ? `${total} itens no cardápio · ${unavailable} esgotado${unavailable === 1 ? "" : "s"}`
            : `${total} itens no cardápio`
        }
      />

      <p className="mt-5 rounded-md bg-surface px-4 py-3 text-[0.8125rem] text-ink-muted hairline">
        O interruptor tira e devolve o item ao cardápio na hora. Criar e editar produto ainda
        não está nesta tela.
      </p>

      <div className="mt-6 space-y-8">
        {catalog.map((section) => (
          <section key={section.category.id}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-[1.5rem] leading-none text-ink">
                {section.category.name}
              </h2>
              <span data-price className="text-[0.8125rem] text-ink-faint">
                {section.products.length}
              </span>
            </div>

            <ul className="divide-y divide-line rounded-lg bg-surface hairline">
              {section.products.map((product) => (
                <li key={product.id} className="flex items-center gap-4 p-3.5">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-paper-sunken">
                    <ProductImage src={product.imageUrl} alt="" sizes="56px" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-display text-[1.125rem] leading-none ${
                        product.available ? "text-ink" : "text-ink-muted"
                      }`}
                    >
                      {product.name}
                    </p>
                    {product.description ? (
                      <p className="clamp-1 mt-1.5 text-[0.8125rem] text-ink-muted">
                        {product.description}
                      </p>
                    ) : null}
                    {product.optionGroups.length > 0 ? (
                      <p className="mt-1.5 text-[0.75rem] text-ink-faint">
                        {product.optionGroups.length}{" "}
                        {product.optionGroups.length === 1 ? "grupo de opções" : "grupos de opções"}
                        {" · "}
                        {product.optionGroups.map((group) => group.name).join(", ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p data-price className="text-[0.9375rem] font-bold text-ink">
                      {formatCents(effectivePriceCents(product))}
                    </p>
                    {hasPromo(product) ? (
                      <p data-price className="text-[0.75rem] text-ink-muted line-through">
                        {formatCents(product.priceCents)}
                      </p>
                    ) : null}
                  </div>

                  <AvailabilityToggle
                    key={`${product.id}:${product.available}`}
                    storeSlug={store.slug}
                    productId={product.id}
                    productName={product.name}
                    available={product.available}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
