import type { Store } from "@/domain/types";
import { cn } from "@/lib/utils";

/**
 * A assinatura da marca é tipográfica.
 *
 * Nada de ícone de hambúrguer nem chama: o nome em condensada de caixa alta,
 * a linha de apoio espaçada embaixo e um risco vermelho curto. Funciona para
 * a BRUTO e continua funcionando para qualquer outra loja da plataforma.
 */
export function Wordmark({
  store,
  size = "md",
  className,
}: {
  store: Store;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const name = {
    sm: "text-[1.375rem]",
    md: "text-[1.75rem]",
    lg: "text-[3rem] sm:text-[4rem]",
    xl: "text-[4rem] sm:text-[6rem] lg:text-[7.5rem]",
  }[size];

  const tagline = {
    sm: "text-[0.5rem] tracking-[0.3em]",
    md: "text-[0.5625rem] tracking-[0.34em]",
    lg: "text-[0.75rem] tracking-[0.42em]",
    xl: "text-[0.875rem] tracking-[0.5em] sm:text-[1rem]",
  }[size];

  return (
    <span className={cn("block leading-none", className)}>
      <span
        className={cn(
          "block font-display leading-[0.85] tracking-[0.005em] text-ink",
          name,
        )}
      >
        {store.name}
      </span>
      {store.tagline ? (
        <span
          className={cn(
            "mt-1 block font-sans font-semibold uppercase text-ink-muted",
            tagline,
          )}
        >
          {store.tagline}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Monograma: inicial em condensada com o risco vermelho da marca.
 * É o que aparece em espaços apertados — header, avatar, favicon.
 */
export function StoreMonogram({ store, className }: { store: Store; className?: string }) {
  const initial = store.name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        "bg-surface-raised font-display leading-none text-ink",
        className,
      )}
    >
      <span className="translate-y-[0.06em]">{initial}</span>
      <span
        className="absolute right-0 top-0 h-[0.22em] w-[0.62em] origin-top-right -rotate-[18deg] bg-[var(--store-brand)]"
      />
    </span>
  );
}
