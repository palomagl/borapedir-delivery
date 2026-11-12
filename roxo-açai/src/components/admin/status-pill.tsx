import { ORDER_STATUS_META } from "@/domain/order";
import type { OrderStatus } from "@/domain/types";
import { cn } from "@/lib/utils";

const TONE = {
  neutral: "bg-surface-raised text-ink-soft",
  info: "bg-brand-soft text-[var(--store-brand)]",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
} as const;

/** O mesmo rótulo de status em toda a administração. */
export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-xs px-2 py-1",
        "text-[0.6875rem] font-bold uppercase tracking-[0.05em]",
        TONE[meta.tone],
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
