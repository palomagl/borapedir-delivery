"use client";

import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { SearchDialog } from "@/components/store/search-dialog";
import { useStore } from "@/components/store/store-context";
import type { Store } from "@/domain/types";
import { useScrolled } from "@/lib/use-scrolled";
import { cn } from "@/lib/utils";

/**
 * Barra fina e permanente, escura, quase invisível sobre o hero.
 *
 * Carrega só o que precisa estar sempre ao alcance: a marca, a busca e a
 * sacola. O estado da loja e os prazos ficam na faixa logo abaixo do hero.
 */
export function StoreHeader({ store }: { store: Store }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { itemCount, products } = useStore();
  const pathname = usePathname();
  const scrolled = useScrolled();

  // Só a home tem hero atrás. Nas outras telas a barra é sólida desde o topo.
  const overHero = pathname === `/${store.slug}` && !scrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 border-b transition-[background-color,border-color] duration-300",
          overHero
            ? "border-transparent bg-transparent"
            : "border-line bg-paper/85 backdrop-blur-xl",
        )}
      >
        <div className="mx-auto flex h-14 max-w-[88rem] items-center gap-3 px-4 lg:h-16 lg:gap-6 lg:px-8">
          <Link
            href={`/${store.slug}`}
            className="flex min-w-0 items-baseline gap-2.5 rounded-xs"
            aria-label={`Início do ${store.name}`}
          >
            <span className="font-display text-[1.5rem] leading-none text-ink lg:text-[1.75rem]">
              {store.name}
            </span>
            {store.tagline ? (
              <>
                <span aria-hidden className="hidden h-3.5 w-px shrink-0 bg-line-strong sm:block" />
                <span className="eyebrow hidden truncate text-ink-muted sm:block">
                  {store.tagline}
                </span>
              </>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              "mx-auto hidden h-10 w-full max-w-md items-center gap-2.5 rounded-md",
              "bg-surface px-4 text-left text-sm text-ink-muted hairline",
              "transition-colors hover:bg-surface-hover lg:flex",
            )}
          >
            <Search className="size-4 shrink-0" aria-hidden />
            Buscar no cardápio
          </button>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar no cardápio"
              className="flex size-10 items-center justify-center rounded-sm text-ink transition-colors hover:bg-surface-hover lg:hidden"
            >
              <Search className="size-[1.125rem]" />
            </button>

            <Link
              href={`/${store.slug}/sacola`}
              aria-label={
                itemCount > 0
                  ? `Sacola com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`
                  : "Sacola vazia"
              }
              className="relative hidden size-10 items-center justify-center rounded-sm text-ink transition-colors hover:bg-surface-hover lg:flex"
            >
              <ShoppingBag className="size-[1.125rem]" />
              {itemCount > 0 ? (
                <span
                  data-price
                  className="absolute right-0 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[var(--store-brand)] px-1 text-[0.625rem] font-bold text-[var(--store-brand-contrast)]"
                >
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} products={products} />
    </>
  );
}
