"use client";

import { ChevronRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCents } from "@/domain/money";
import { isFinal, ORDER_STATUS_META } from "@/domain/order";
import type { Order } from "@/domain/types";
import { formatRelative } from "@/lib/format";
import { readMyOrderIds } from "@/lib/my-orders";
import { getOrdersByIds } from "@/server/actions/orders";
import { cn } from "@/lib/utils";

const TONE_CLASS = {
  neutral: "bg-surface-raised text-ink-soft",
  info: "bg-brand-soft text-[var(--store-brand)]",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
} as const;

/**
 * "Meus pedidos" sem cadastro.
 *
 * O navegador guarda os ids dos pedidos que esta pessoa fez; o conteúdo vem
 * sempre do servidor. Assim a aba funciona de primeira, sem login.
 */
export function OrdersList() {
  const { store } = useStore();
  const [orders, setOrders] = React.useState<Order[] | null>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      const ids = readMyOrderIds(store.slug);
      try {
        const result = ids.length > 0 ? await getOrdersByIds(store.slug, ids) : [];
        if (active) setOrders(result);
      } catch {
        // Falhou a consulta: mostra a lista vazia em vez de travar no esqueleto.
        if (active) setOrders([]);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [store.slug]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 lg:px-8 lg:pt-10">
      <h1 className="font-display text-[2rem] leading-none text-ink lg:text-[2.5rem]">
        Seus pedidos
      </h1>
      <p className="mt-1.5 text-[0.875rem] text-ink-muted">
        Os pedidos feitos neste aparelho ficam aqui.
      </p>

      {orders === null ? (
        <ul className="mt-6 space-y-3">
          {[0, 1].map((index) => (
            <li key={index} className="rounded-lg bg-surface p-4 hairline">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-3 h-4 w-3/5" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </li>
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Nenhum pedido por aqui"
          description="Quando você fizer um pedido, ele aparece nesta lista para você acompanhar."
          action={
            <Button asChild>
              <Link href={`/${store.slug}`}>Ver cardápio</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            const items = order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ");

            return (
              <li key={order.id}>
                <Link
                  href={`/${store.slug}/pedidos/${order.id}`}
                  className={cn(
                    "flex items-center gap-4 rounded-lg bg-surface p-4 hairline",
                    "transition-colors hover:bg-surface-hover",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span data-price className="font-display text-[1.375rem] leading-none text-ink">
                        #{order.number}
                      </span>
                      <span
                        className={cn(
                          "rounded-xs px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.04em]",
                          TONE_CLASS[meta.tone],
                        )}
                      >
                        {meta.customerLabel}
                      </span>
                      {!isFinal(order.status) ? (
                        <span className="text-[0.75rem] text-ink-muted">
                          {formatRelative(order.createdAt)}
                        </span>
                      ) : null}
                    </div>

                    <p className="clamp-1 mt-2 text-[0.8125rem] text-ink-muted">{items}</p>

                    <p data-price className="mt-1.5 text-[0.9375rem] font-bold text-ink">
                      {formatCents(order.totalCents)}
                    </p>
                  </div>

                  <ChevronRight className="size-5 shrink-0 text-ink-faint" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
