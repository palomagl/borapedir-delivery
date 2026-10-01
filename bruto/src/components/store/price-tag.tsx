import { effectivePriceCents, hasPromo } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { Product } from "@/domain/types";
import { cn } from "@/lib/utils";

/**
 * O preço é o que o olho procura depois da foto. Ele fica em tinta cheia, não
 * em verde de app de cupom — e a promoção aparece como o preço antigo cortado,
 * discreto, ao lado.
 */
export function PriceTag({
  product,
  size = "md",
  className,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const price = effectivePriceCents(product);
  const promo = hasPromo(product);

  const priceSize = {
    sm: "text-[0.9375rem]",
    md: "text-base",
    lg: "text-[1.375rem]",
  }[size];

  const oldSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span
        data-price
        className={cn("font-bold tracking-[-0.02em] text-ink", priceSize)}
      >
        {formatCents(price)}
      </span>
      {promo ? (
        <span data-price className={cn("text-ink-muted line-through", oldSize)}>
          {formatCents(product.priceCents)}
        </span>
      ) : null}
    </span>
  );
}
