import { sumCents } from "./money";
import type { Order, OrderStatus } from "./types";

/**
 * Números do dia para a operação.
 *
 * Tudo aqui sai dos pedidos reais. Nenhuma métrica é inventada para encher
 * painel: se não dá para calcular, não aparece.
 */

/** Status que ainda exigem alguém da loja fazendo alguma coisa. */
const AWAITING: readonly OrderStatus[] = ["pending", "accepted", "preparing", "ready"];

export interface DaySummary {
  orderCount: number;
  /** Cancelados não entram no faturamento. */
  revenueCents: number;
  /** Ticket médio do dia. Zero quando não houve pedido. */
  averageTicketCents: number;
  awaitingCount: number;
}

function startOfDay(reference: Date): number {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

export function ordersOfDay(orders: readonly Order[], reference: Date = new Date()): Order[] {
  const from = startOfDay(reference);
  return orders.filter((order) => new Date(order.createdAt).getTime() >= from);
}

export function summarizeDay(orders: readonly Order[], reference: Date = new Date()): DaySummary {
  const today = ordersOfDay(orders, reference);
  const billable = today.filter((order) => order.status !== "canceled");
  const revenueCents = sumCents(billable.map((order) => order.totalCents));

  return {
    orderCount: today.length,
    revenueCents,
    averageTicketCents: billable.length > 0 ? Math.round(revenueCents / billable.length) : 0,
    awaitingCount: orders.filter((order) => AWAITING.includes(order.status)).length,
  };
}

export function awaitingAction(orders: readonly Order[]): Order[] {
  return orders
    .filter((order) => AWAITING.includes(order.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export interface ProductTally {
  productId: string | null;
  name: string;
  quantity: number;
  revenueCents: number;
}

/**
 * Mais pedidos, contados pelos itens congelados no pedido — e não pelo
 * catálogo atual. Produto removido do cardápio continua aparecendo no
 * histórico, que é o comportamento correto.
 */
export function topProducts(orders: readonly Order[], limit = 5): ProductTally[] {
  const tally = new Map<string, ProductTally>();

  for (const order of orders) {
    if (order.status === "canceled") continue;

    for (const item of order.items) {
      const key = item.productId ?? item.productName;
      const current = tally.get(key) ?? {
        productId: item.productId,
        name: item.productName,
        quantity: 0,
        revenueCents: 0,
      };

      current.quantity += item.quantity;
      current.revenueCents += item.totalCents;
      tally.set(key, current);
    }
  }

  return [...tally.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenueCents - a.revenueCents)
    .slice(0, limit);
}
