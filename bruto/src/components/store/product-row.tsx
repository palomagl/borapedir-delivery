"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/store/product-image";
import { PriceTag } from "@/components/store/price-tag";
import { useProductModal } from "@/components/store/product-modal";
import { useStore } from "@/components/store/store-context";
import { effectivePriceCents, hasPromo, isSimpleProduct } from "@/domain/catalog";
import type { Product } from "@/domain/types";
import { cn } from "@/lib/utils";

/**
 * A linha do cardápio.
 *
 * Informação à esquerda, foto à direita: é a leitura natural em português e
 * deixa o preço alinhado numa coluna só, fácil de varrer com o olho.
 *
 * O botão "+" resolve em um toque o que não precisa de escolha. Produto com
 * opções abre a folha — nunca se adiciona algo incompleto ao carrinho.
 */
export function ProductRow({ product, priority }: { product: Product; priority?: boolean }) {
  const { open } = useProductModal();
  const { addItem } = useStore();

  const unavailable = !product.available;
  const simple = isSimpleProduct(product);
  const promo = hasPromo(product);

  const discount = promo
    ? Math.round((1 - effectivePriceCents(product) / product.priceCents) * 100)
    : 0;

  function handleQuickAdd(event: React.MouseEvent) {
    event.stopPropagation();
    if (simple) {
      addItem(product, [], null, 1);
      toast.success(`${product.name} na sacola`);
    } else {
      open(product);
    }
  }

  return (
    <div
      className={cn(
        "catalog-product group relative flex gap-3 rounded-[22px] border border-line bg-gradient-to-br from-surface to-paper p-3 lg:gap-4 lg:p-4",
        "transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-out-quint)]",
        unavailable
          ? "opacity-50"
          : "hover:bg-surface-hover hover:shadow-md active:scale-[0.995]",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="min-w-0">
          <h3 className="font-bold text-sm leading-snug tracking-tight text-ink lg:text-lg">
            {/* O botão cobre a linha inteira: alvo grande sem aninhar botões. */}
            <button
              type="button"
              onClick={() => open(product)}
              disabled={unavailable}
              className="text-left after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--store-brand)] disabled:cursor-default"
            >
              {product.name}
            </button>
          </h3>

          {product.description ? (
            <p className="clamp-2 mt-1.5 text-[0.8125rem] leading-[1.45] text-ink-muted lg:text-sm">
              {product.description}
            </p>
          ) : null}
        </div>

        <div className="mt-2.5 flex items-center gap-2 pr-10">
          {unavailable ? (
            <span className="text-[0.8125rem] font-semibold text-ink-muted">Indisponível hoje</span>
          ) : (
            <PriceTag product={product} />
          )}
        </div>
      </div>

      <div className="order-first shrink-0">
        <div
          className={cn(
            "relative size-[5.5rem] overflow-hidden rounded-md bg-paper-sunken sm:size-24 lg:size-28",
            !unavailable && "transition-transform duration-300 ease-[var(--ease-out-quint)]",
          )}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            priority={priority}
            sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 88px"
            className={cn(
              "transition-transform duration-500 ease-[var(--ease-out-quint)]",
              !unavailable && "group-hover:scale-[1.06]",
            )}
          />

          {promo && !unavailable ? (
            <span
              data-price
              className="absolute left-1 top-1 rounded-full bg-[var(--store-brand)] px-1.5 py-0.5 text-[0.625rem] font-bold text-[var(--store-brand-contrast)]"
            >
              −{discount}%
            </span>
          ) : null}
        </div>

        {unavailable ? null : (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={simple ? `Adicionar ${product.name} à sacola` : `Escolher opções de ${product.name}`}
            className={cn(
              "absolute bottom-3 right-3 z-10 flex size-8 items-center justify-center rounded-xl lg:bottom-4 lg:right-4 lg:size-10",
              "border border-orange-400/50 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-md",
              "transition-[background-color,color,transform] duration-150",
              "hover:brightness-110",
              "active:scale-90",
            )}
          >
            <Plus className="size-[1.125rem]" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
