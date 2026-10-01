import { notFound } from "next/navigation";
import { CartPanel } from "@/components/store/cart-items";
import { CategoryPills, CategoryRail } from "@/components/store/category-nav";
import { FeaturedCard } from "@/components/store/featured-card";
import { ProductRow } from "@/components/store/product-row";
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
    .slice(0, 8);

  return (
    <>
      <StoreHero store={store} />

      <div id="cardapio" className="mx-auto max-w-[88rem] scroll-mt-16 px-4 lg:px-8">
        {/*
          As pílulas ficam soltas aqui de propósito: um `sticky` só gruda
          dentro do próprio pai, e um invólucro da altura dela mesma faria a
          barra sumir no primeiro rolar.
        */}
        <CategoryPills categories={categories} />

        {/*
          Três colunas no desktop: navegação, cardápio e sacola. No tablet o
          cardápio ocupa a largura toda em duas colunas; no celular, uma.
        */}
        <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[12rem_minmax(0,1fr)_22rem] xl:gap-10">
          <div className="lg:pt-2">
            <CategoryRail categories={categories} />
          </div>

          <main className="pb-10 lg:pb-16">
            {featured.length > 0 ? (
              <section className="pt-6 lg:pt-2" aria-labelledby="destaques">
                <h2 id="destaques" className="font-display text-[1.75rem] text-ink lg:text-[2rem]">
                  Mais pedidos
                </h2>
                {/* Sangra até a borda no celular para a faixa parecer contínua. */}
                <div className="scroll-x -mx-4 mt-3.5 flex snap-x snap-mandatory gap-3 px-4 pb-1 lg:mx-0 lg:px-0">
                  {featured.map((product) => (
                    <FeaturedCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ) : null}

            {catalog.map((section, sectionIndex) => (
              <section
                key={section.category.id}
                id={sectionId(section.category)}
                aria-labelledby={`${sectionId(section.category)}-titulo`}
                className="scroll-mt-28 pt-9 lg:scroll-mt-24 lg:pt-10"
              >
                <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2
                    id={`${sectionId(section.category)}-titulo`}
                    className="font-display text-[2rem] text-ink lg:text-[2.5rem]"
                  >
                    {section.category.name}
                  </h2>
                  {section.category.subtitle ? (
                    <p className="eyebrow text-ink-muted">{section.category.subtitle}</p>
                  ) : null}
                </div>

                {/*
                  Duas colunas só quando cada linha ainda tem largura para
                  duas frases de descrição. Antes disso, uma coluna larga
                  informa mais do que duas espremidas.
                */}
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 2xl:gap-3">
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

          <div className="lg:pt-2">
            <CartPanel />
          </div>
        </div>
      </div>
    </>
  );
}
