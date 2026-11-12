"use client";

import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { Toaster as Sonner } from "sonner";

/** Feedback de ação. Curto, no canto, nunca bloqueando o que a pessoa faz. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset={16}
      mobileOffset={{ bottom: 88 }}
      duration={2600}
      gap={8}
      icons={{
        success: <CircleCheck className="size-[1.125rem] text-success" />,
        error: <CircleAlert className="size-[1.125rem] text-danger" />,
        info: <Info className="size-[1.125rem] text-ink-soft" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          // No escuro o aviso sobe de nível em vez de inverter a cor.
          toast:
            "flex w-full items-center gap-2.5 rounded-md bg-surface-raised px-4 py-3 text-ink shadow-lg hairline",
          title: "text-[0.875rem] font-semibold leading-snug",
          description: "text-[0.8125rem] text-ink-muted",
          actionButton:
            "ml-auto shrink-0 rounded-xs px-2 py-1 text-[0.8125rem] font-bold text-[var(--store-brand)] hover:bg-brand-soft",
        },
      }}
    />
  );
}

export { toast } from "sonner";
