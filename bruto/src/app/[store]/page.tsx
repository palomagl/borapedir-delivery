import { notFound } from "next/navigation";
import { CategoryPills } from "@/components/store/category-nav";
import { FeaturedCard } from "@/components/store/featured-card";
import { ProductRow } from "@/components/store/product-row";
import { StoreDetails } from "@/components/store/store-details";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
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

            <StoreDetails />
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
          <footer className="mb-6 border-t border-line py-10 lg:py-14">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
              <div>
                <Link href={`/${store.slug}`} className="store-wordmark text-4xl uppercase">{store.name}<span className="text-[var(--store-brand)]">.</span></Link>
                <p className="mt-3 text-sm text-ink-soft">{store.headline ?? store.tagline}</p>
                {store.address ? <p className="mt-4 flex max-w-sm items-start gap-2 text-xs leading-relaxed text-ink-muted"><MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />{store.address}</p> : null}
              </div>
              <nav aria-label="Mais sobre a casa" className="grid gap-4 text-sm font-medium">
                <Link className="flex items-center justify-between gap-10 hover:text-[var(--store-brand)]" href={`/${store.slug}/pedidos`}>Acompanhar meu pedido<ArrowUpRight className="size-4" aria-hidden /></Link>
                <Link className="flex items-center justify-between gap-10 hover:text-[var(--store-brand)]" href={`/${store.slug}/perfil`}>Conheça a casa<ArrowUpRight className="size-4" aria-hidden /></Link>
                <Link className="flex items-center justify-between gap-10 hover:text-[var(--store-brand)]" href={`/${store.slug}/ofertas`}>Ofertas da casa<ArrowUpRight className="size-4" aria-hidden /></Link>
              </nav>
            </div>
            <p className="mt-8 border-t border-line pt-5 text-xs text-ink-muted">{store.tagline} · Peça direto com a casa.</p>
          </footer>


        </div>
      </div>
    </>
  );
}
