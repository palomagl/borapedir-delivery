"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  /** No carrinho, chegar a zero remove o item — o ícone precisa avisar. */
  removable?: boolean;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  removable = false,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantidade",
}: QuantityStepperProps) {
  const willRemove = removable && value <= min;
  const canDecrease = removable || value > min;

  const box = size === "sm" ? "h-9" : "h-11";
  const button = size === "sm" ? "size-9" : "size-11";
  const text = size === "sm" ? "text-sm min-w-7" : "text-[0.9375rem] min-w-9";

  return (
    <div
      className={cn("inline-flex items-center rounded-full bg-paper-sunken", box)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        aria-label={willRemove ? "Remover item" : "Diminuir quantidade"}
        className={cn(
          "flex items-center justify-center rounded-full text-ink-soft",
          "transition-colors hover:bg-line hover:text-ink active:scale-95",
          "disabled:opacity-35 disabled:hover:bg-transparent",
          willRemove && "hover:bg-danger-soft hover:text-danger",
          button,
        )}
      >
        {willRemove ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
      </button>

      <span
        data-price
        aria-live="polite"
        className={cn("text-center font-bold text-ink", text)}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className={cn(
          "flex items-center justify-center rounded-full text-ink-soft",
          "transition-colors hover:bg-line hover:text-ink active:scale-95",
          "disabled:opacity-35 disabled:hover:bg-transparent",
          button,
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
