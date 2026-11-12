"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { CartLineItem, CartSummary } from "@/components/store/cart-items";
import { ServiceModeToggle } from "@/components/store/service-mode-toggle";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { nextOpeningLabel } from "@/domain/catalog";
import { formatCents } from "@/domain/money";

export function CartPage() {
  const { store, lines, totals, hydrated, isOpen } = useStore();
  const belowMinimum = totals.missingForMinimumCents > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-5 lg:px-8 lg:pb-16 lg:pt-8">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="-ml-2 lg:hidden">
          <Link href={`/${store.slug}`} aria-label="Voltar ao cardápio">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-[2rem] leading-none text-ink lg:text-[2.25rem]">
          Sua sacola
        </h1>
      </div>

      {!hydrated ? (
        <div className="mt-6 space-y-4">
          {[0, 1].map((index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-16 rounded-sm" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-9 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sua sacola está vazia"
          description="Volte ao cardápio e escolha o que vai pedir hoje."
          action={
            <Button asChild>
              <Link href={`/${store.slug}`}>Ver cardápio</Link>
            </Button>
          }
        />
      ) : (
        <>
          {!isOpen ? (
            <p className="mt-5 rounded-md bg-warning-soft px-4 py-3 text-[0.8125rem] font-medium text-warning">
              A loja está fechada agora. Você pode montar a sacola — ela fica salva até a
              próxima abertura.
            </p>
          ) : null}

          <div className="mt-5">
            <ServiceModeToggle />
          </div>

          <ul className="mt-5 divide-y divide-line rounded-lg bg-surface px-4 hairline">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} />
            ))}
          </ul>

          <Button asChild variant="ghost" size="sm" className="mt-3">
            <Link href={`/${store.slug}`}>
              <ArrowLeft />
              Adicionar mais itens
            </Link>
          </Button>

          <div className="mt-6 rounded-lg bg-surface p-4 hairline lg:p-5">
            <h2 className="mb-3 text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">Resumo</h2>
            <CartSummary />
          </div>

          {/* No celular a ação fica colada ao polegar; no desktop, no fluxo. */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pb-3 pt-3 backdrop-blur-xl safe-b lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {!isOpen ? (
              <Button size="lg" block disabled>
                {nextOpeningLabel(store) ?? "Loja fechada agora"}
              </Button>
            ) : belowMinimum ? (
              <Button size="lg" block disabled>
                Faltam {formatCents(totals.missingForMinimumCents)} para o mínimo
              </Button>
            ) : (
              <Button asChild size="lg" block>
                <Link href={`/${store.slug}/checkout`}>
                  <span>Ir para o pagamento</span>
                  <span aria-hidden className="opacity-50">
                    ·
                  </span>
                  <span data-price>{formatCents(totals.totalCents)}</span>
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
