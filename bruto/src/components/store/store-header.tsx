"use client";

import { MapPin, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SearchDialog } from "@/components/store/search-dialog";
import { useStore } from "@/components/store/store-context";
import type { Store } from "@/domain/types";

export function StoreHeader({ store }: { store: Store }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { itemCount, products } = useStore();
  const city = store.address?.split(",").at(-1)?.trim();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-[76rem] items-center gap-4 px-5 lg:h-24 lg:gap-12 lg:px-8">
          <details className="relative lg:hidden">
            <summary aria-label="Abrir menu" className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-line [&::-webkit-details-marker]:hidden"><Menu className="size-6" /></summary>
            <nav aria-label="Menu" className="absolute left-0 top-12 grid w-48 gap-1 rounded-2xl border border-line bg-surface p-3 shadow-lg">
              <Link className="rounded-lg p-3 hover:bg-surface-hover" href={`/${store.slug}`}>Cardápio</Link>
              <Link className="rounded-lg p-3 hover:bg-surface-hover" href={`/${store.slug}/pedidos`}>Meus pedidos</Link>
              <Link className="rounded-lg p-3 hover:bg-surface-hover" href={`/${store.slug}/ofertas`}>Ofertas</Link>
              <Link className="rounded-lg p-3 hover:bg-surface-hover" href={`/entrar?de=/admin/${store.slug}`}>Entrar</Link>
            </nav>
          </details>
          <Link href={`/${store.slug}`} aria-label={`Início do ${store.name}`} className="store-wordmark uppercase text-[1.9rem] leading-none lg:text-[3rem]">{store.name}<span className="text-[var(--store-brand)]">.</span></Link>
          {city ? <span className="hidden items-center gap-2 text-base text-ink lg:flex"><MapPin className="size-5" />{city}</span> : null}
          <div className="ml-auto flex items-center gap-8">
            <button type="button" onClick={() => setSearchOpen(true)} className="hidden items-center gap-3 text-base hover:text-[var(--store-brand)] lg:flex"><Search className="size-6" />Buscar</button>
            <Link href={`/entrar?de=/admin/${store.slug}`} className="hidden items-center gap-3 text-base hover:text-[var(--store-brand)] lg:flex"><UserRound className="size-6" />Entrar</Link>
            <Link href={`/${store.slug}/sacola`} aria-label={`Sacola com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`} className="orange-action relative flex size-11 items-center justify-center rounded-2xl lg:h-14 lg:w-[4.75rem] lg:rounded-[22px]">
              <ShoppingCart className="size-6 lg:size-7" strokeWidth={1.6} />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-black">{itemCount}</span> : null}
            </Link>
          </div>
        </div>
        <div className="px-5 pb-4 lg:hidden">
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-11 w-full items-center gap-3 rounded-full border border-line-strong bg-surface px-4 text-left text-sm text-ink-soft"><Search className="size-5" />Buscar no cardápio...</button>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} products={products} />
    </>
  );
}
