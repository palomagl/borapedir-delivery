"use client";

import * as React from "react";
import { toast } from "sonner";
import { setProductAvailability } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

/**
 * Esgotar e reativar item.
 *
 * Resposta imediata na tela e correção se o servidor recusar: numa noite
 * cheia, esperar ida e volta para tirar um item do cardápio é tempo que a
 * loja não tem.
 */
export function AvailabilityToggle({
  storeSlug,
  productId,
  productName,
  available,
}: {
  storeSlug: string;
  productId: string;
  productName: string;
  available: boolean;
}) {
  // O servidor é a verdade: quando a lista recarrega com outro valor, ela
  // remonta este componente pela `key`, e o estado nasce de novo já correto.
  const [optimistic, setOptimistic] = React.useState(available);
  const [pending, setPending] = React.useState(false);

  async function toggle() {
    const next = !optimistic;
    setOptimistic(next);
    setPending(true);

    const result = await setProductAvailability(storeSlug, productId, next);
    setPending(false);

    if (result.ok) {
      toast.success(next ? `${productName} de volta ao cardápio` : `${productName} esgotado`);
    } else {
      setOptimistic(!next);
      toast.error(result.error);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={`${productName}: ${optimistic ? "disponível" : "esgotado"}`}
      onClick={toggle}
      disabled={pending}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        "disabled:opacity-60",
        optimistic ? "bg-success" : "bg-surface-raised ring-1 ring-line-strong",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-[1.125rem] rounded-full bg-paper transition-transform duration-200 ease-[var(--ease-out-quint)]",
          optimistic ? "translate-x-[1.4375rem]" : "translate-x-[0.1875rem]",
        )}
      />
    </button>
  );
}
