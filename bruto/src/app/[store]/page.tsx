import { Bike, Clock } from "lucide-react";
import { formatCents } from "@/domain/money";
import { formatEta } from "@/lib/format";
import { notFound } from "next/navigation";
import { CategoryPills } from "@/components/store/category-nav";
import { FeaturedCard } from "@/components/store/featured-card";
import { ProductRow } from "@/components/store/product-row";
import { ServiceModeToggle } from "@/components/store/service-mode-toggle";
import { StoreHero } from "@/components/store/store-hero";
import { sectionId } from "@/lib/section-id";
import { loadCatalog, loadStore } from "@/server/store-data";

interface StorePageProps {
  params: Promise<{ store: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const catalog = await loadCatalog(store.id);
  const categories = catalog.map((section) => section.category);
  const featured = catalog
    .flatMap((section) => section.products)
    .filter((product) => product.featured && product.available)
    .slice(0, 3);

  return (
    <>
      <StoreHero store={store} />

      <div id="cardapio" className="mx-auto max-w-[76rem] scroll-mt-36 px-4 lg:px-8">
        {/*
          As pílulas ficam soltas aqui de propósito: um `sticky` só gruda
          dentro do próprio pai, e um invólucro da altura dela mesma faria a
          barra sumir no primeiro rolar.
        */}
        <CategoryPills categories={categories} />

        <div>
          <main className="pb-10 lg:pb-16">
            {featured.length > 0 ? (
              <section className="pt-6 lg:pt-2" aria-labelledby="destaques">
                <h2 id="destaques" className="font-display text-[1.75rem] text-ink lg:text-[2rem]">
                  Destaques da casa
                </h2>
                <div className="mt-5 grid gap-3 lg:grid-cols-3 lg:gap-5">
                  {featured.map((product) => (
                    <FeaturedCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-line py-4">
              <div className="w-full max-w-sm"><ServiceModeToggle /></div>
              <p className="flex items-center gap-2 text-xs text-ink-muted"><Clock aria-hidden className="size-4" />{formatEta(store.deliveryEtaMinutes)}<Bike aria-hidden className="ml-2 size-4" />{store.deliveryFeeCents === 0 ? "Entrega grátis" : formatCents(store.deliveryFeeCents)}</p>
            </div>
            {catalog.map((section, sectionIndex) => (
              <section
                key={section.category.id}
                id={sectionId(section.category)}
                aria-labelledby={`${sectionId(section.category)}-titulo`}
                className="scroll-mt-56 pt-9 lg:scroll-mt-48 lg:pt-10"
              >
                <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2
                    id={`${sectionId(section.category)}-titulo`}
                    className="font-display text-[1.5rem] text-ink lg:text-[2rem]"
                  >
                    {section.category.name}
                  </h2>
                  {section.category.subtitle ? (
                    <p className="eyebrow text-ink-muted">{section.category.subtitle}</p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                  {section.products.map((product, index) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      priority={sectionIndex === 0 && index < 4}
                    />
                  ))}
                </div>
              </section>
            ))}
          </main>


        </div>
      </div>
    </>
  );
}
