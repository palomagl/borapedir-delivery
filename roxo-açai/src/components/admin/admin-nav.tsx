"use client";

import {
  ExternalLink,
  LogOut,
  LayoutGrid,
  ReceiptText,
  Settings,
  Tags,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Navegação da operação.
 *
 * Trilho fixo no desktop, onde a loja realmente trabalha. No celular vira uma
 * faixa rolável — dá para conferir pedido pelo telefone sem perder a lista.
 */
const LINKS = [
  { href: "", label: "Painel", icon: LayoutGrid },
  { href: "/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/produtos", label: "Produtos", icon: UtensilsCrossed },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

interface AdminNavProps {
  storeSlug: string;
  storeName: string;
  /** Aparece ao lado de "Pedidos" quando há pedido esperando alguém. */
  awaitingCount: number;
}

export function AdminNav({ storeSlug, storeName, awaitingCount }: AdminNavProps) {
  const pathname = usePathname();
  const base = `/admin/${storeSlug}`;

  function isActive(href: string) {
    return href === "" ? pathname === base : pathname.startsWith(`${base}${href}`);
  }

  return (
    <>
      {/* Desktop: trilho fixo à esquerda */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <span className="font-display text-[1.375rem] leading-none text-ink">{storeName}</span>
          <span className="eyebrow text-ink-faint">Admin</span>
        </div>

        <nav aria-label="Administração" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {LINKS.map((link) => (
              <li key={link.label}>
                <NavLink
                  href={`${base}${link.href}`}
                  icon={link.icon}
                  label={link.label}
                  active={isActive(link.href)}
                  badge={link.href === "/pedidos" ? awaitingCount : 0}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-3">
          <Link
            href={`/${storeSlug}`}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-3 py-2 text-[0.8125rem] font-medium",
              "text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink",
            )}
          >
            <ExternalLink className="size-4" aria-hidden />
            Ver a loja
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Celular e tablet: cabeçalho compacto e faixa rolável */}
      <div className="sticky top-0 z-30 border-b border-line bg-paper/92 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <span className="font-display text-[1.375rem] leading-none text-ink">{storeName}</span>
          <span className="eyebrow text-ink-faint">Admin</span>
          <Link
            href={`/${storeSlug}`}
            className="ml-auto flex size-9 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
            aria-label="Ver a loja"
          >
            <ExternalLink className="size-[1.125rem]" />
          </Link>
        </div>

        <nav aria-label="Administração" className="scroll-x flex gap-1.5 px-4 pb-2.5">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={`${base}${link.href}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5",
                  "text-[0.8125rem] font-semibold transition-colors",
                  active ? "bg-ink text-paper" : "bg-surface text-ink-muted hairline",
                )}
              >
                {link.label}
                {link.href === "/pedidos" && awaitingCount > 0 ? (
                  <span
                    data-price
                    className={cn(
                      "rounded-full px-1.5 text-[0.625rem] font-bold",
                      active ? "bg-paper/15 text-paper" : "bg-[var(--store-brand)] text-[var(--store-brand-contrast)]",
                    )}
                  >
                    {awaitingCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  badge: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-sm px-3 py-2 text-[0.875rem] transition-colors",
        active
          ? "bg-surface-raised font-semibold text-ink"
          : "font-medium text-ink-muted hover:bg-surface-hover hover:text-ink",
      )}
    >
      <Icon
        className={cn("size-[1.125rem] shrink-0", active ? "text-[var(--store-brand)]" : "")}
        aria-hidden
      />
      {label}
      {badge > 0 ? (
        <span
          data-price
          className="ml-auto rounded-full bg-[var(--store-brand)] px-1.5 py-0.5 text-[0.625rem] font-bold text-[var(--store-brand-contrast)]"
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
