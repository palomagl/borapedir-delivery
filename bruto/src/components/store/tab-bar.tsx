"use client";

import { Home, ReceiptText, Store, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Quatro destinos, nada mais. A sacola não entra aqui: ela é uma ação, não um
 * lugar, e aparece como barra própria só quando existe algo dentro.
 */
const TABS = [
  { href: "", label: "Início", icon: Home },
  { href: "/ofertas", label: "Ofertas", icon: Tag },
  { href: "/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/perfil", label: "A casa", icon: Store },
] as const;

export function StoreTabBar({ storeSlug }: { storeSlug: string }) {
  const pathname = usePathname();
  const base = `/${storeSlug}`;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/92 backdrop-blur-xl safe-b lg:hidden"
    >
      <ul className="flex h-[var(--spacing-tabbar)] items-stretch">
        {TABS.map((tab) => {
          const href = `${base}${tab.href}`;
          const active = tab.href === "" ? pathname === base : pathname.startsWith(href);
          const Icon = tab.icon;

          return (
            <li key={tab.label} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 transition-colors",
                  active ? "text-[var(--store-brand)]" : "text-ink-muted",
                )}
              >
                <Icon
                  className="size-[1.375rem]"
                  strokeWidth={active ? 2.4 : 1.9}
                  aria-hidden
                />
                <span className={cn("text-[0.6875rem]", active ? "font-bold" : "font-medium")}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
