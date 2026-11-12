import { ArrowRight, CheckCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderCard } from "@/components/admin/order-card";
import { PageHeader } from "@/components/admin/page-header";
import { Stat } from "@/components/admin/stat";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCents } from "@/domain/money";
import { awaitingAction, ordersOfDay, summarizeDay, topProducts } from "@/domain/stats";
import { getDataSource } from "@/server/data";
import { loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Painel" };

const TODAY = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const orders = await getDataSource().listOrders(store.id);
  const summary = summarizeDay(orders);
  const waiting = awaitingAction(orders);
  const ranking = topProducts(ordersOfDay(orders), 5);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Painel" description={TODAY.format(new Date())} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pedidos hoje" value={String(summary.orderCount)} />
        <Stat
          label="Faturamento hoje"
          value={formatCents(summary.revenueCents)}
          detail="Cancelados não entram"
        />
        <Stat
          label="Esperando você"
          value={String(summary.awaitingCount)}
          detail={summary.awaitingCount > 0 ? "Pedidos sem conclusão" : "Nada parado"}
          urgent={summary.awaitingCount > 0}
          href={`/admin/${store.slug}/pedidos`}
        />
        <Stat
          label="Ticket médio"
          value={summary.orderCount > 0 ? formatCents(summary.averageTicketCents) : "—"}
        />
      </div>

      <section className="mt-9">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-[1.5rem] leading-none text-ink">Esperando você</h2>
          {waiting.length > 4 ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/${store.slug}/pedidos`}>
                Ver todos os {waiting.length}
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>

        {waiting.length === 0 ? (
          <div className="rounded-lg bg-surface hairline">
            <EmptyState
              icon={CheckCheck}
              title="Tudo em dia"
              description="Nenhum pedido aguardando ação neste momento."
              className="py-12"
            />
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {waiting.slice(0, 4).map((order) => (
              <OrderCard key={order.id} order={order} storeId={store.id} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9">
        <h2 className="mb-4 font-display text-[1.5rem] leading-none text-ink">Mais pedidos hoje</h2>

        {ranking.length === 0 ? (
          <p className="rounded-lg bg-surface px-5 py-8 text-center text-[0.875rem] text-ink-muted hairline">
            Ainda não houve pedido hoje.
          </p>
        ) : (
          <ol className="divide-y divide-line rounded-lg bg-surface hairline">
            {ranking.map((entry, index) => (
              <li
                key={entry.productId ?? entry.name}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span
                  data-price
                  className="w-5 shrink-0 font-display text-[1.25rem] leading-none text-ink-faint"
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-ink">
                  {entry.name}
                </span>
                <span data-price className="shrink-0 text-[0.8125rem] text-ink-muted">
                  {entry.quantity} {entry.quantity === 1 ? "unidade" : "unidades"}
                </span>
                <span
                  data-price
                  className="w-24 shrink-0 text-right text-[0.9375rem] font-bold text-ink"
                >
                  {formatCents(entry.revenueCents)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
