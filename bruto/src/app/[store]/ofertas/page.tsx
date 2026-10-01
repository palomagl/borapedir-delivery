import { Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRow } from "@/components/store/product-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { hasPromo } from "@/domain/catalog";
import { loadCatalog, loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Ofertas" };

export default async function OffersPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const products = (await loadCatalog(store.id)).flatMap((section) => section.products);
  const promos = products.filter((product) => hasPromo(product) && product.available);
  const picks = products.filter(
    (product) => product.featured && product.available && !hasPromo(product),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 lg:px-8 lg:pt-10">
      <h1 className="font-display text-[2rem] leading-none text-ink lg:text-[2.5rem]">Ofertas</h1>
      <p className="mt-1.5 text-[0.875rem] text-ink-muted">
        Preço baixo enquanto durar. Sem letra miúda.
      </p>

      {promos.length === 0 && picks.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Nenhuma oferta agora"
          description="Assim que a casa soltar uma promoção, ela aparece aqui primeiro."
          action={
            <Button asChild>
              <Link href={`/${store.slug}`}>Ver cardápio</Link>
            </Button>
          }
        />
      ) : null}

      {promos.length > 0 ? (
        <section className="mt-7">
          <h2 className="font-display text-[1.5rem] leading-none text-ink">Com desconto</h2>
          <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
            {promos.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {picks.length > 0 ? (
        <section className="mt-9">
          <h2 className="font-display text-[1.5rem] leading-none text-ink">Os mais pedidos</h2>
          <p className="eyebrow mt-1 text-ink-muted">O que sai mais da chapa</p>
          <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
            {picks.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
