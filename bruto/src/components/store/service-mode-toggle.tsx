"use client";

import { Bike, Store as StoreIcon } from "lucide-react";
import { useStore } from "@/components/store/store-context";
import { formatCents } from "@/domain/money";
import { formatEta } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS = { delivery: Bike, pickup: StoreIcon } as const;
const LABELS = { delivery: "Entrega", pickup: "Retirada" } as const;

/**
 * Entrega ou retirada muda taxa, prazo e checkout inteiro. Por isso a escolha
 * fica no topo do cardápio, e não escondida no fim da compra.
 */
export function ServiceModeToggle() {
  const { store, serviceMode, setServiceMode } = useStore();

  if (store.serviceModes.length < 2) return null;

  return (
    <div
      role="radiogroup"
      aria-label="Como você quer receber"
      className="flex gap-1 rounded-lg bg-paper-sunken p-1"
    >
      {store.serviceModes.map((mode) => {
        const Icon = ICONS[mode];
        const active = serviceMode === mode;

        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setServiceMode(mode)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2.5",
              "transition-all duration-200 sm:flex-row sm:gap-2",
              active ? "bg-surface shadow-sm" : "text-ink-muted hover:text-ink-soft",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon
                className={cn("size-[1.125rem] shrink-0", active ? "text-[var(--store-brand)]" : "")}
                aria-hidden
              />
              <span className={cn("text-sm", active ? "font-bold text-ink" : "font-medium")}>
                {LABELS[mode]}
              </span>
            </span>
            {/* No celular a informação desce para a segunda linha em vez de quebrar. */}
            <span
              data-price
              className={cn(
                "whitespace-nowrap text-[0.75rem] sm:text-[0.8125rem]",
                active ? "text-ink-muted" : "text-ink-faint",
              )}
            >
              {mode === "delivery"
                ? `${formatEta(store.deliveryEtaMinutes)} · ${store.deliveryFeeCents === 0 ? "grátis" : formatCents(store.deliveryFeeCents)}`
                : formatEta(store.pickupEtaMinutes)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
