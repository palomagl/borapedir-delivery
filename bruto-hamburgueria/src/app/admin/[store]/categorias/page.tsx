import { GripVertical } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { loadCatalog, loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Categorias" };

export default async function AdminCategories({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const catalog = await loadCatalog(store.id);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Categorias"
        description="A ordem daqui é a ordem em que o cliente vê o cardápio."
      />

      <p className="mt-5 rounded-md bg-surface px-4 py-3 text-[0.8125rem] text-ink-muted hairline">
        Criar, renomear e reordenar categoria ainda não está nesta tela.
      </p>

      <ul className="mt-6 divide-y divide-line rounded-lg bg-surface hairline">
        {catalog.map((section) => (
          <li key={section.category.id} className="flex items-center gap-4 p-4">
            <GripVertical className="size-4 shrink-0 text-ink-faint" aria-hidden />

            <div className="min-w-0 flex-1">
              <p className="font-display text-[1.25rem] leading-none text-ink">
                {section.category.name}
              </p>
              {section.category.subtitle ? (
                <p className="mt-1.5 text-[0.8125rem] text-ink-muted">
                  {section.category.subtitle}
                </p>
              ) : null}
              <p className="mt-1.5 font-mono text-[0.75rem] text-ink-faint">
                /{store.slug}#categoria-{section.category.slug}
              </p>
            </div>

            <span data-price className="shrink-0 text-[0.8125rem] text-ink-muted">
              {section.products.length}{" "}
              {section.products.length === 1 ? "produto" : "produtos"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
