"use client";

import { Plus } from "lucide-react";
import { ProductImage } from "@/components/store/product-image";
import { useProductModal } from "@/components/store/product-modal";
import { effectivePriceCents, hasPromo } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { Product } from "@/domain/types";

/**
 * Destaque é a única peça do cardápio em que a foto manda. Fica numa faixa
 * horizontal curta no topo — o resto da navegação continua sendo a lista.
 */
export function FeaturedCard({ product }: { product: Product }) {
  const { open } = useProductModal();

  return (
    <button
      type="button"
      onClick={() => open(product)}
      className="group relative w-[15rem] shrink-0 snap-start overflow-hidden rounded-lg border border-line bg-surface text-left transition-colors hover:border-line-strong lg:w-full lg:min-w-0"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-paper-sunken">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1408px) 253px, (min-width: 1280px) calc((100vw - 640px) / 3), (min-width: 1024px) calc((100vw - 576px) / 3), 240px"
          className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:scale-[1.05]"
        />
        {hasPromo(product) ? (
          <span
            data-price
            className="absolute left-2.5 top-2.5 rounded-full bg-[var(--store-brand)] px-2 py-1 text-[0.6875rem] font-bold text-[var(--store-brand-contrast)]"
          >
            Promoção
          </span>
        ) : null}
      </span>

      <span className="block px-3 pb-4 pt-3">
        <span className="clamp-2 block min-h-9 font-display text-[1.125rem] leading-none text-ink">
          {product.name}
        </span>
        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 pr-8">
          <span data-price className="text-[0.9375rem] font-bold text-ink">
            {formatCents(effectivePriceCents(product))}
          </span>
          {hasPromo(product) ? (
            <span data-price className="text-xs text-ink-muted line-through">
              {formatCents(product.priceCents)}
            </span>
          ) : null}
        </span>
      </span>
      <span aria-hidden className="absolute bottom-3 right-3 flex size-7 items-center justify-center rounded-md bg-[var(--store-brand)] text-[var(--store-brand-contrast)]"><Plus className="size-4" /></span>
    </button>
  );
}
