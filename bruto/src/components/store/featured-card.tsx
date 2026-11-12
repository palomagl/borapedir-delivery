"use client";

import { Plus } from "lucide-react";
import { ProductImage } from "@/components/store/product-image";
import { useProductModal } from "@/components/store/product-modal";
import { effectivePriceCents, hasPromo } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { Product } from "@/domain/types";

export function FeaturedCard({ product }: { product: Product }) {
  const { open } = useProductModal();
  return (
    <button type="button" onClick={() => open(product)} className="group relative flex w-full gap-3 overflow-hidden rounded-[22px] border border-line bg-gradient-to-br from-surface to-paper p-3 text-left transition-colors hover:border-[var(--store-brand)] lg:block lg:p-0">
      <span className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-paper-sunken lg:aspect-[2/1] lg:h-auto lg:w-full lg:rounded-none">
        <ProductImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 380px, 96px" className="transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col pr-8 lg:px-5 lg:pb-5 lg:pt-3">
        <span className="font-display block text-base lg:text-lg">{product.name}</span>
        <span className="clamp-2 mt-1 text-xs leading-snug text-ink-soft lg:min-h-9 lg:text-sm">{product.description}</span>
        <span className="mt-3 flex flex-wrap items-baseline gap-2 pr-8">
          <span data-price className="text-lg font-extrabold tracking-tight lg:text-xl">{formatCents(effectivePriceCents(product))}</span>
          {hasPromo(product) ? <span data-price className="text-xs text-ink-muted line-through">{formatCents(product.priceCents)}</span> : null}
        </span>
      </span>
      <span aria-hidden className="orange-action absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-xl lg:bottom-4 lg:right-4 lg:size-10"><Plus className="size-5" /></span>
    </button>
  );
}
