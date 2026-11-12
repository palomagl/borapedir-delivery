import { UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCents, sumCents } from "@/domain/money";
import { formatPhone, formatRelative, initials } from "@/lib/format";
import { getDataSource } from "@/server/data";
import { loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Clientes" };

export default async function AdminCustomers({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const source = getDataSource();
  const [customers, orders] = await Promise.all([
    source.listCustomers(store.id),
    source.listOrders(store.id),
  ]);

  // O histórico vem dos pedidos, não de um contador guardado no cadastro:
  // assim o número nunca fica dessincronizado da realidade.
  const rows = customers
    .map((customer) => {
      const own = orders.filter(
        (order) => order.customerId === customer.id && order.status !== "canceled",
      );
      return {
        customer,
        orderCount: own.length,
        spentCents: sumCents(own.map((order) => order.totalCents)),
        lastOrderAt: own[0]?.createdAt ?? null,
      };
    })
    .sort((a, b) => b.spentCents - a.spentCents);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Clientes"
        description={`${customers.length} ${customers.length === 1 ? "cadastro" : "cadastros"} · pedidos de convidados não geram cadastro`}
      />

      {rows.length === 0 ? (
        <div className="mt-6 rounded-lg bg-surface hairline">
          <EmptyState
            icon={UsersRound}
            title="Nenhum cliente cadastrado"
            description="Os cadastros aparecem aqui conforme as pessoas pedem pela loja."
            className="py-14"
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-lg bg-surface hairline">
          {rows.map(({ customer, orderCount, spentCents, lastOrderAt }) => (
            <li key={customer.id} className="flex items-center gap-4 p-4">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-[0.8125rem] font-bold text-ink-soft"
              >
                {initials(customer.name)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] font-bold text-ink">{customer.name}</p>
                <p data-price className="mt-0.5 text-[0.8125rem] text-ink-muted">
                  {formatPhone(customer.phone)}
                  {customer.email ? ` · ${customer.email}` : ""}
                </p>
                {customer.addresses.length > 0 ? (
                  <p className="clamp-1 mt-0.5 text-[0.75rem] text-ink-faint">
                    {customer.addresses[0].street}, {customer.addresses[0].number} —{" "}
                    {customer.addresses[0].district}
                  </p>
                ) : null}
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p data-price className="text-[0.8125rem] text-ink-muted">
                  {orderCount} {orderCount === 1 ? "pedido" : "pedidos"}
                </p>
                {lastOrderAt ? (
                  <p className="mt-0.5 text-[0.75rem] text-ink-faint">
                    último {formatRelative(lastOrderAt)}
                  </p>
                ) : null}
              </div>

              <p
                data-price
                className="w-24 shrink-0 text-right font-display text-[1.375rem] leading-none text-ink"
              >
                {formatCents(spentCents)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
