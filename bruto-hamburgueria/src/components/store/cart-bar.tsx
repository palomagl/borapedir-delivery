"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/store/store-context";
import { formatCents } from "@/domain/money";
import { cn } from "@/lib/utils";

/**
 * Sacola sempre ao alcance no celular, flutuando acima da barra de navegação.
 *
 * Só existe quando há itens — barra vazia permanente rouba altura de tela em
 * troca de nada. Somem também nas telas onde ela seria redundante.
 */
export function CartBar({ storeSlug }: { storeSlug: string }) {
  const { itemCount, totals, hydrated } = useStore();
  const pathname = usePathname();

  const suppressed =
    pathname.startsWith(`/${storeSlug}/sacola`) || pathname.startsWith(`/${storeSlug}/checkout`);

  if (!hydrated || itemCount === 0 || suppressed) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom,0px))] z-30",
        "px-3 pb-2.5 lg:hidden",
      )}
    >
      <Link
        href={`/${storeSlug}/sacola`}
        className={cn(
          "flex h-14 items-center gap-3 rounded-lg px-4 shadow-lg",
          "bg-[var(--store-brand)] text-[var(--store-brand-contrast)]",
          "transition-transform duration-200 ease-[var(--ease-out-quint)] active:scale-[0.985]",
          "animate-in slide-in-from-bottom-4 fade-in duration-300",
        )}
      >
        <span className="relative flex size-9 items-center justify-center rounded-full bg-black/15">
          <ShoppingBag className="size-[1.125rem]" aria-hidden />
        </span>

        <span className="flex-1 text-left">
          <span className="block text-[0.9375rem] font-bold leading-tight">Ver sacola</span>
          <span className="block text-xs font-medium opacity-80">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </span>
        </span>

        <span data-price className="text-base font-bold tracking-[-0.02em]">
          {formatCents(totals.totalCents)}
        </span>
      </Link>
    </div>
  );
}
