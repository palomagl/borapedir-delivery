"use client";

import { Clock, MapPin, Wallet } from "lucide-react";
import { ServiceModeToggle } from "@/components/store/service-mode-toggle";
import { useStore } from "@/components/store/store-context";
import { formatCents } from "@/domain/money";
import { formatEta } from "@/lib/format";

/** Operational details use the same live store state as the checkout. */
export function StoreDetails() {
  const { store, isOpen, serviceMode } = useStore();
  return (
    <section aria-label="Informações para pedir" className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-line bg-surface/50 p-4 lg:px-5">
      <div className="w-full max-w-sm"><ServiceModeToggle /></div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-ink-soft">
        <span className="flex items-center gap-2 font-semibold"><span aria-hidden className={`size-2 rounded-full ${isOpen ? "bg-success" : "bg-ink-muted"}`} />{isOpen ? "Aberto agora" : "Fechado agora"}</span>
        <span className="flex items-center gap-2"><Clock className="size-4 text-[var(--store-brand)]" aria-hidden />{formatEta(serviceMode === "delivery" ? store.deliveryEtaMinutes : store.pickupEtaMinutes)}</span>
        {serviceMode === "delivery" && store.minOrderCents > 0 ? <span className="flex items-center gap-2"><Wallet className="size-4 text-[var(--store-brand)]" aria-hidden />Mínimo {formatCents(store.minOrderCents)}</span> : null}
        {serviceMode === "pickup" && store.address ? <span className="flex max-w-xs items-start gap-2"><MapPin className="size-4 shrink-0 text-[var(--store-brand)]" aria-hidden />{store.address}</span> : null}
      </div>
    </section>
  );
}
