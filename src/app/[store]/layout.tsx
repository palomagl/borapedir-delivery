import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartBar } from "@/components/store/cart-bar";
import { ProductModalProvider } from "@/components/store/product-modal";
import { StoreHeader } from "@/components/store/store-header";
import { StoreProvider } from "@/components/store/store-context";
import { StoreTabBar } from "@/components/store/tab-bar";
import { isStoreOpen } from "@/domain/catalog";
import { loadCatalog, loadStore } from "@/server/store-data";

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}

export async function generateMetadata({ params }: StoreLayoutProps): Promise<Metadata> {
  const { store: slug } = await params;
  const store = await loadStore(slug);
  if (!store) return { title: "Loja não encontrada" };

  return {
    title: { default: store.name, template: `%s · ${store.name}` },
    description: store.tagline ?? `Peça online no ${store.name}.`,
  };
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const catalog = await loadCatalog(store.id);
  const searchable = catalog.flatMap((section) => section.products);

  return (
    <StoreProvider store={store} products={searchable} initiallyOpen={isStoreOpen(store)}>
      <ProductModalProvider>
        {/*
          O tema da loja entra como variável CSS num único ponto. Todo botão,
          foco e destaque abaixo daqui herda a cor do estabelecimento.
        */}
        <div
          className="min-h-dvh"
          style={
            {
              "--store-brand": store.theme.brand,
              "--store-brand-contrast": store.theme.brandContrast,
            } as React.CSSProperties
          }
        >
          <StoreHeader store={store} />

          <div className="pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom,0px))] lg:pb-16">
            {children}
          </div>

          <CartBar storeSlug={store.slug} />
          <StoreTabBar storeSlug={store.slug} />
        </div>
      </ProductModalProvider>
    </StoreProvider>
  );
}
