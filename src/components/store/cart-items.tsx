"use client";

import { Pencil, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProductImage } from "@/components/store/product-image";
import { useProductModal } from "@/components/store/product-modal";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { lineTotalCents, type CartLine } from "@/domain/cart";
import { formatCents } from "@/domain/money";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- Item do carrinho */

export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const { updateQuantity, removeItem, addItem, getProduct } = useStore();
  const { open } = useProductModal();

  const product = getProduct(line.productId);
  const configurable = Boolean(product && product.optionGroups.length > 0);

  function handleQuantity(next: number) {
    if (next <= 0) {
      removeItem(line.key);
      // Remover por engano é o erro mais caro do carrinho: sempre há volta.
      toast.success(`${line.productName} removido`, {
        action: product
          ? {
              label: "Desfazer",
              onClick: () => addItem(product, line.selections, line.note, line.quantity),
            }
          : undefined,
      });
      return;
    }
    updateQuantity(line.key, next);
  }

  function handleEdit() {
    if (!product) return;
    open(product, {
      key: line.key,
      selections: line.selections,
      note: line.note,
      quantity: line.quantity,
    });
  }

  const summary = line.selections.map((selection) => selection.optionName).join(" · ");

  return (
    <li className={cn("flex gap-3", compact ? "py-3" : "py-4")}>
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-sm bg-paper-sunken",
          compact ? "size-12" : "size-16",
        )}
      >
        <ProductImage
          src={line.productImageUrl}
          alt=""
          sizes={compact ? "48px" : "64px"}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "min-w-0 font-bold leading-snug tracking-[-0.01em] text-ink",
              compact ? "text-[0.875rem]" : "text-[0.9375rem]",
            )}
          >
            {line.productName}
          </p>
          <span
            data-price
            className={cn(
              "shrink-0 font-bold tracking-[-0.02em] text-ink",
              compact ? "text-[0.875rem]" : "text-[0.9375rem]",
            )}
          >
            {formatCents(lineTotalCents(line))}
          </span>
        </div>

        {summary ? (
          <p className="clamp-2 mt-0.5 text-[0.8125rem] leading-snug text-ink-muted">{summary}</p>
        ) : null}

        {line.note ? (
          <p className="clamp-2 mt-1 text-[0.8125rem] leading-snug text-ink-soft">
            <span className="font-semibold">Obs.:</span> {line.note}
          </p>
        ) : null}

        <div className="mt-2.5 flex items-center gap-2">
          <QuantityStepper
            value={line.quantity}
            onChange={handleQuantity}
            removable
            size="sm"
            label={`Quantidade de ${line.productName}`}
          />

          {configurable ? (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Pencil aria-hidden />
              Editar
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------- Resumo */

export function CartSummary({ className }: { className?: string }) {
  const { totals, serviceMode, store } = useStore();

  return (
    <dl className={cn("space-y-2 text-[0.875rem]", className)}>
      <Row label="Subtotal" value={formatCents(totals.subtotalCents)} />
      <Row
        label={serviceMode === "delivery" ? "Taxa de entrega" : "Retirada no local"}
        value={
          serviceMode === "pickup"
            ? "Grátis"
            : totals.deliveryFeeCents === 0
              ? "Grátis"
              : formatCents(totals.deliveryFeeCents)
        }
      />
      {totals.discountCents > 0 ? (
        <Row label="Desconto" value={`− ${formatCents(totals.discountCents)}`} tone="success" />
      ) : null}

      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <dt className="text-[0.9375rem] font-bold text-ink">Total</dt>
        <dd data-price className="text-lg font-bold tracking-[-0.025em] text-ink">
          {formatCents(totals.totalCents)}
        </dd>
      </div>

      {totals.missingForMinimumCents > 0 ? (
        <p className="!mt-3 rounded-md bg-warning-soft px-3 py-2.5 text-[0.8125rem] font-medium text-warning">
          Faltam <span data-price>{formatCents(totals.missingForMinimumCents)}</span> para o pedido
          mínimo de <span data-price>{formatCents(store.minOrderCents)}</span>.
        </p>
      ) : null}
    </dl>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        data-price
        className={cn("font-semibold", tone === "success" ? "text-success" : "text-ink")}
      >
        {value}
      </dd>
    </div>
  );
}

/* ------------------------------------------------- Painel lateral (desktop) */

export function CartPanel() {
  const { lines, totals, store, hydrated, isOpen } = useStore();
  const empty = lines.length === 0;
  const belowMinimum = totals.missingForMinimumCents > 0;

  return (
    <aside className="sticky top-24 hidden lg:block" aria-label="Sua sacola">
      <div className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-lg bg-surface shadow-sm hairline">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-[1.375rem] leading-none text-ink">
            Sua sacola
          </h2>
          {!empty ? (
            <span className="rounded-full bg-paper-sunken px-2 py-0.5 text-xs font-bold text-ink-soft">
              {totals.itemCount}
            </span>
          ) : null}
        </div>

        {!hydrated ? (
          <div className="px-5 py-12" />
        ) : empty ? (
          <EmptyState
            icon={ShoppingBag}
            title="Sacola vazia"
            description="Escolha um item do cardápio para começar seu pedido."
            className="py-10"
          />
        ) : (
          <>
            <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
              {lines.map((line) => (
                <CartLineItem key={line.key} line={line} compact />
              ))}
            </ul>

            <div className="shrink-0 border-t border-line px-5 py-4">
              <CartSummary />
              {!isOpen ? (
                <Button size="lg" block className="mt-4" disabled>
                  Loja fechada agora
                </Button>
              ) : belowMinimum ? (
                <Button size="lg" block className="mt-4" disabled>
                  Pedido mínimo não atingido
                </Button>
              ) : (
                <Button asChild size="lg" block className="mt-4">
                  <Link href={`/${store.slug}/checkout`}>Finalizar pedido</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
