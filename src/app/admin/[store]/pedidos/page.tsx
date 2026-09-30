import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderCard } from "@/components/admin/order-card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrderStatus } from "@/domain/types";
import { getDataSource } from "@/server/data";
import { loadStore } from "@/server/store-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };

/**
 * Os filtros são por etapa da operação, não por status cru: quem está no
 * balcão pensa em "o que preparar", não em "quais registros têm status
 * accepted ou preparing".
 */
interface Filter {
  id: string;
  label: string;
  /** null significa "sem filtro": mostra tudo. */
  statuses: readonly OrderStatus[] | null;
}

const FILTERS: readonly Filter[] = [
  { id: "ativos", label: "Ativos", statuses: ["pending", "accepted", "preparing", "ready", "out_for_delivery"] },
  { id: "novos", label: "Novos", statuses: ["pending"] },
  { id: "preparo", label: "Em preparo", statuses: ["accepted", "preparing"] },
  { id: "saida", label: "Prontos e a caminho", statuses: ["ready", "out_for_delivery"] },
  { id: "concluidos", label: "Concluídos", statuses: ["delivered"] },
  { id: "cancelados", label: "Cancelados", statuses: ["canceled"] },
  { id: "todos", label: "Todos", statuses: null },
];

interface PageProps {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ filtro?: string }>;
}

export default async function AdminOrders({ params, searchParams }: PageProps) {
  const [{ store: slug }, query] = await Promise.all([params, searchParams]);

  const store = await loadStore(slug);
  if (!store) notFound();

  const selected = FILTERS.find((filter) => filter.id === query.filtro) ?? FILTERS[0];
  const active = selected.id;

  const all = await getDataSource().listOrders(store.id);
  // A cópia local é o que deixa o TypeScript estreitar o `null` dentro da
  // closure — a propriedade sozinha ele não consegue garantir.
  const countFor = (statuses: readonly OrderStatus[] | null) =>
    statuses === null ? all.length : all.filter((order) => statuses.includes(order.status)).length;

  const counts = new Map<string, number>(
    FILTERS.map((filter) => [filter.id, countFor(filter.statuses)]),
  );

  const selectedStatuses = selected.statuses;
  const orders =
    selectedStatuses === null
      ? all
      : all.filter((order) => selectedStatuses.includes(order.status));

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Pedidos"
        description="Aceite, prepare e despache. A lista recarrega a cada ação."
      />

      <nav aria-label="Filtrar pedidos" className="scroll-x mt-5 flex gap-2 pb-1">
        {FILTERS.map((filter) => {
          const isActive = filter.id === active;
          const count = counts.get(filter.id) ?? 0;

          return (
            <Link
              key={filter.id}
              href={`/admin/${store.slug}/pedidos?filtro=${filter.id}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2",
                "text-[0.8125rem] font-semibold transition-colors",
                isActive ? "bg-ink text-paper" : "bg-surface text-ink-muted hairline hover:text-ink",
              )}
            >
              {filter.label}
              <span
                data-price
                className={cn(
                  "rounded-full px-1.5 text-[0.6875rem] font-bold",
                  isActive ? "bg-paper/15" : "bg-surface-raised text-ink-faint",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <div className="mt-4 rounded-lg bg-surface hairline">
          <EmptyState
            icon={Inbox}
            title="Nenhum pedido aqui"
            description="Quando entrar um pedido neste estágio, ele aparece nesta lista."
            className="py-14"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} storeId={store.id} />
          ))}
        </div>
      )}
    </div>
  );
}
