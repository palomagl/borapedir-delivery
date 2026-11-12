"use client";

import { Bike, MessageSquareWarning, Phone, Store as StoreIcon, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/domain/money";
import { isFinal, ORDER_STATUS_META, primaryAction } from "@/domain/order";
import type { Order, OrderStatus } from "@/domain/types";
import { formatPhone, formatRelative, formatTime, PAYMENT_LABELS } from "@/lib/format";
import { advanceOrderStatus } from "@/server/actions/orders";
import { cn } from "@/lib/utils";

/**
 * Um pedido, inteiro, sem precisar abrir nada.
 *
 * A cozinha não quer clicar para descobrir o que preparar: itens, opções e
 * observações ficam à vista, e a próxima ação é um botão só. A observação
 * ganha destaque porque é o que mais se perde na correria.
 */
export function OrderCard({ order, storeId }: { order: Order; storeId: string }) {
  const [pending, setPending] = React.useState(false);
  const next = primaryAction(order.status, order.serviceMode);
  const canCancel = !isFinal(order.status) && order.status !== "out_for_delivery";

  async function move(status: OrderStatus) {
    setPending(true);
    const result = await advanceOrderStatus(storeId, order.id, status);
    setPending(false);

    // O aviso confirma o estado alcançado, não o verbo do botão: quem leu
    // "Aceitar" quer ler "Aceito".
    if (result.ok) toast.success(`Pedido #${order.number} · ${ORDER_STATUS_META[status].label}`);
    else toast.error(result.error);
  }

  const ModeIcon = order.serviceMode === "delivery" ? Bike : StoreIcon;

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg bg-surface hairline",
        // Pedido novo puxa o olho: é o único que exige decisão imediata.
        order.status === "pending" && "shadow-[inset_0_0_0_1.5px_var(--store-brand)]",
      )}
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line p-4">
        <span data-price className="font-display text-[1.75rem] leading-none text-ink">
          #{order.number}
        </span>
        <StatusPill status={order.status} />

        <span className="ml-auto flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
          <ModeIcon className="size-3.5" aria-hidden />
          {order.serviceMode === "delivery" ? "Entrega" : "Retirada"}
        </span>
        <span data-price className="text-[0.75rem] text-ink-muted">
          {formatTime(order.createdAt)} · {formatRelative(order.createdAt)}
        </span>
      </header>

      <div className="flex-1 p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[0.9375rem] font-bold text-ink">{order.customerName}</p>
          <a
            href={`tel:+55${order.customerPhone}`}
            className="flex items-center gap-1.5 text-[0.8125rem] text-ink-muted hover:text-ink"
          >
            <Phone className="size-3.5" aria-hidden />
            {formatPhone(order.customerPhone)}
          </a>
        </div>

        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-2.5 text-[0.875rem]">
              <span
                data-price
                className="mt-px shrink-0 rounded-xs bg-surface-raised px-1.5 py-0.5 text-[0.75rem] font-bold text-ink"
              >
                {item.quantity}×
              </span>
              <span className="min-w-0">
                <span className="text-ink">{item.productName}</span>
                {item.options.length > 0 ? (
                  <span className="block text-[0.8125rem] text-ink-muted">
                    {item.options
                      .map((option) => option.optionName)
                      .join(" · ")}
                  </span>
                ) : null}
                {item.note ? (
                  <span className="mt-1 flex items-start gap-1.5 text-[0.8125rem] font-medium text-warning">
                    <MessageSquareWarning className="mt-px size-3.5 shrink-0" aria-hidden />
                    {item.note}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        {order.note ? (
          <p className="mt-3 flex items-start gap-2 rounded-sm bg-warning-soft px-3 py-2 text-[0.8125rem] font-medium text-warning">
            <MessageSquareWarning className="mt-px size-4 shrink-0" aria-hidden />
            {order.note}
          </p>
        ) : null}

        {order.address ? (
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-soft">
            {order.address.street}, {order.address.number}
            {order.address.complement ? ` — ${order.address.complement}` : ""}
            <span className="block text-ink-muted">
              {order.address.district}
              {order.address.reference ? ` · ${order.address.reference}` : ""}
            </span>
          </p>
        ) : null}
      </div>

      <footer className="border-t border-line p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[0.8125rem] text-ink-muted">
            {PAYMENT_LABELS[order.paymentMethod]}
            {order.changeForCents ? (
              <span className="block text-warning">
                Troco para {formatCents(order.changeForCents)}
              </span>
            ) : null}
          </span>
          <span data-price className="font-display text-[1.75rem] leading-none text-ink">
            {formatCents(order.totalCents)}
          </span>
        </div>

        {next || canCancel ? (
          <div className="mt-4 flex gap-2">
            {next ? (
              <Button
                size="md"
                className="flex-1"
                loading={pending}
                onClick={() => move(next.status)}
              >
                {next.label}
              </Button>
            ) : null}

            {canCancel ? (
              <Button
                size="md"
                variant="ghost"
                disabled={pending}
                onClick={() => move("canceled")}
                aria-label={`Cancelar pedido ${order.number}`}
              >
                <X />
                <span className="sr-only sm:not-sr-only">Cancelar</span>
              </Button>
            ) : null}
          </div>
        ) : null}
      </footer>
    </article>
  );
}
