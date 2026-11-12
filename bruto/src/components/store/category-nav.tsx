"use client";

import { CupSoda, IceCreamBowl, Popcorn, Sandwich } from "lucide-react";
import * as React from "react";
import type { Category } from "@/domain/types";
import { sectionId } from "@/lib/section-id";
import { cn } from "@/lib/utils";

/**
 * A navegação de categorias segue a rolagem em vez de exigir um clique.
 *
 * A faixa de observação começa logo abaixo dos cabeçalhos fixos e termina no
 * meio da tela: assim a categoria destacada é a que a pessoa está realmente
 * lendo, não a que passou de raspão pelo topo.
 */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(ids[0] ?? null);

  React.useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-215px 0px -35% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Faixa horizontal fixa — composição de celular e tablet. */
export function CategoryPills({ categories }: { categories: Category[] }) {
  const ids = React.useMemo(() => categories.map(sectionId), [categories]);
  const active = useActiveSection(ids);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Mantém a pílula ativa visível enquanto a pessoa rola a página.
  React.useEffect(() => {
    if (!active) return;
    const pill = listRef.current?.querySelector<HTMLElement>(`[data-target="${active}"]`);
    pill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div className="sticky top-[7.5rem] z-20 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur-xl lg:top-24">
      <ul ref={listRef} className="scroll-x flex gap-2 py-3 lg:gap-4 lg:py-4">
        {categories.map((category, index) => {
          const Icon = [Sandwich, Popcorn, Popcorn, CupSoda, IceCreamBowl][index % 5];
          const label = { "os-brabos": "Hambúrgueres", "pra-dividir": "Acompanhamentos", "pra-beber": "Bebidas" }[category.slug] ?? category.name;
          const id = sectionId(category);
          const isActive = active === id;

          return (
            <li key={category.id} className="min-w-[5.25rem] shrink-0 flex-1 lg:flex-none">
              <button
                type="button"
                data-target={id}
                onClick={() => scrollToSection(id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-line px-2 py-3 text-[0.625rem] font-semibold transition-colors sm:text-xs lg:min-h-14 lg:flex-row lg:gap-3 lg:rounded-full lg:px-7 lg:py-3 lg:text-sm",
                  isActive
                    ? "orange-action border-transparent text-white"
                    : "bg-surface text-ink-soft hairline hover:bg-surface-hover",
                )}
              >
                <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
                <span className="text-center leading-tight lg:whitespace-nowrap">{label === "Acompanhamentos" ? <><span className="lg:hidden">Acomp.</span><span className="hidden lg:inline">{label}</span></> : label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Trilho vertical — composição de mesa, onde há largura sobrando à esquerda. */
export function CategoryRail({ categories }: { categories: Category[] }) {
  const ids = React.useMemo(() => categories.map(sectionId), [categories]);
  const active = useActiveSection(ids);

  return (
    <nav aria-label="Categorias" className="sticky top-24 hidden lg:block">
      <p className="mb-3 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-faint">
        Cardápio
      </p>
      <ul className="space-y-0.5">
        {categories.map((category) => {
          const id = sectionId(category);
          const isActive = active === id;

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => scrollToSection(id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative w-full rounded-sm px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-brand-soft font-bold text-[var(--store-brand)]"
                    : "font-medium text-ink-soft hover:bg-surface-hover hover:text-ink",
                )}
              >
                {category.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
