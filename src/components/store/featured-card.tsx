"use client";

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
      className="group w-[15rem] shrink-0 snap-start text-left lg:w-[17rem]"
    >
      <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-paper-sunken shadow-sm">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 272px, 240px"
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

      <span className="mt-2.5 block px-0.5">
        <span className="block truncate font-display text-[1.125rem] leading-none text-ink">
          {product.name}
        </span>
        <span className="mt-1.5 flex items-baseline gap-2">
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
    </button>
  );
}
