"use client";

import { Check, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { formatCents } from "@/domain/money";
import { isFinal, ORDER_STATUS_META, trackingSteps } from "@/domain/order";
import type { Order, Store } from "@/domain/types";
import { formatDateTime, formatEta, PAYMENT_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Acompanhamento do pedido.
 *
 * A pergunta que a pessoa tem é uma só — "e aí, como está?" — então a etapa
 * atual ocupa o topo e o resto é consulta.
 */
export function OrderTracking({
  order,
  store,
  justPlaced,
}: {
  order: Order;
  store: Store;
  justPlaced: boolean;
}) {
  const router = useRouter();
  const steps = trackingSteps(order.serviceMode);
  const currentIndex = steps.indexOf(order.status);
  const canceled = order.status === "canceled";
  const meta = ORDER_STATUS_META[order.status];

  // Enquanto o pedido anda, a página se atualiza sozinha. Depois de entregue
  // ou cancelado não há mais o que buscar.
  React.useEffect(() => {
    if (isFinal(order.status)) return;
    const timer = window.setInterval(() => router.refresh(), 20_000);
    return () => window.clearInterval(timer);
  }, [order.status, router]);

  const eta = order.serviceMode === "delivery" ? store.deliveryEtaMinutes : store.pickupEtaMinutes;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 lg:px-8 lg:pt-10">
      {justPlaced ? (
        <p className="mb-5 flex items-center gap-2.5 rounded-md bg-success-soft px-4 py-3.5 text-[0.875rem] font-semibold text-success">
          <PartyPopper className="size-[1.125rem] shrink-0" aria-hidden />
          Pedido enviado. A cozinha já foi avisada.
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-muted">Pedido</p>
          <p data-price className="font-display text-[3rem] leading-none text-ink">
            #{order.number}
          </p>
        </div>
        <span
          className={cn(
            "mt-1 shrink-0 rounded-md px-3 py-1.5 text-[0.8125rem] font-bold",
            canceled ? "bg-danger-soft text-danger" : "bg-brand-soft text-[var(--store-brand)]",
          )}
        >
          {meta.customerLabel}
        </span>
      </div>

      <p className="mt-2 text-[0.875rem] text-ink-muted">
        Feito em {formatDateTime(order.createdAt)}
        {!isFinal(order.status) ? (
          <>
            {" · "}
            {order.serviceMode === "delivery" ? "Entrega" : "Retirada"} prevista em {formatEta(eta)}
          </>
        ) : null}
      </p>

      {canceled ? (
        <p className="mt-6 rounded-md bg-danger-soft px-4 py-3.5 text-[0.875rem] text-danger">
          Este pedido foi cancelado. Em caso de dúvida, fale com a loja pelo telefone{" "}
          {store.phone ?? "da casa"}.
        </p>
      ) : (
        <ol className="mt-7">
          {steps.map((step, index) => {
            const done = index < currentIndex;
            const current = index === currentIndex;
            const last = index === steps.length - 1;

            return (
              <li key={step} className="relative flex gap-3.5 pb-6 last:pb-0">
                {!last ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[0.6875rem] top-6 h-full w-0.5 -translate-x-1/2",
                      done ? "bg-[var(--store-brand)]" : "bg-line",
                    )}
                  />
                ) : null}

                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-0.5 flex size-[1.375rem] shrink-0 items-center justify-center rounded-full transition-colors",
                    done || current
                      ? "bg-[var(--store-brand)] text-[var(--store-brand-contrast)]"
                      : "bg-surface-raised text-transparent ring-1 ring-line-strong",
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" strokeWidth={3.5} />
                  ) : current ? (
                    <span className="size-2 rounded-full bg-[var(--store-brand-contrast)]" />
                  ) : null}
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[0.9375rem] leading-tight",
                      current ? "font-bold text-ink" : done ? "font-medium text-ink-soft" : "text-ink-faint",
                    )}
                  >
                    {ORDER_STATUS_META[step].customerLabel}
                  </span>
                  {current ? (
                    <span className="mt-1 block text-[0.8125rem] text-ink-muted">
                      Atualizamos esta página sozinhos assim que mudar.
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <section className="mt-8 rounded-lg bg-surface p-4 hairline lg:p-5">
        <h2 className="font-display text-[1.375rem] leading-none text-ink">Seu pedido</h2>

        <ul className="mt-4 divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="text-[0.9375rem] text-ink">
                  <span data-price className="font-bold">
                    {item.quantity}×
                  </span>{" "}
                  {item.productName}
                </span>
                {item.options.length > 0 ? (
                  <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">
                    {item.options.map((option) => option.optionName).join(" · ")}
                  </span>
                ) : null}
                {item.note ? (
                  <span className="mt-0.5 block text-[0.8125rem] text-ink-soft">
                    Obs.: {item.note}
                  </span>
                ) : null}
              </span>
              <span data-price className="shrink-0 text-[0.9375rem] font-semibold text-ink">
                {formatCents(item.totalCents)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[0.875rem]">
          <SummaryRow label="Subtotal" value={formatCents(order.subtotalCents)} />
          {order.serviceMode === "delivery" ? (
            <SummaryRow label="Taxa de entrega" value={formatCents(order.deliveryFeeCents)} />
          ) : null}
          {order.discountCents > 0 ? (
            <SummaryRow label="Desconto" value={`− ${formatCents(order.discountCents)}`} />
          ) : null}
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="text-[0.9375rem] font-bold text-ink">Total</dt>
            <dd data-price className="font-display text-[1.5rem] leading-none text-ink">
              {formatCents(order.totalCents)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-lg bg-surface p-4 hairline lg:p-5">
        <dl className="space-y-3 text-[0.875rem]">
          <DetailRow label={order.serviceMode === "delivery" ? "Entregar em" : "Retirar em"}>
            {order.address ? (
              <>
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` — ${order.address.complement}` : ""}
                <span className="block text-ink-muted">
                  {order.address.district}, {order.address.city}/{order.address.state}
                </span>
                {order.address.reference ? (
                  <span className="block text-ink-muted">{order.address.reference}</span>
                ) : null}
              </>
            ) : (
              (store.address ?? store.name)
            )}
          </DetailRow>

          <DetailRow label="Pagamento">
            {PAYMENT_LABELS[order.paymentMethod]}
            {order.changeForCents ? (
              <span className="block text-ink-muted">
                Troco para {formatCents(order.changeForCents)}
              </span>
            ) : null}
          </DetailRow>

          <DetailRow label="Contato">{order.customerName}</DetailRow>

          {order.note ? <DetailRow label="Observação">{order.note}</DetailRow> : null}
        </dl>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd data-price className="font-semibold text-ink">
        {value}
      </dd>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <dt className="w-24 shrink-0 font-semibold text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-ink">{children}</dd>
    </div>
  );
}
