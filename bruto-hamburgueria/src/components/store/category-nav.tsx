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

    let frame = 0;
    function update() {
      const mobile = window.matchMedia("(max-width: 1023px)").matches;
      const nav = document.querySelector<HTMLElement>('[aria-label="Categorias do cardápio"]');
      const threshold = mobile ? 56 + (nav?.offsetHeight ?? 92) + 24 : 128;
      let current = ids[0];
      for (const id of ids) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= threshold) current = id;
      }
      setActive(current);
    }
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const mobile = window.matchMedia("(max-width: 1023px)").matches;
  const categoryNav = document.querySelector<HTMLElement>('[aria-label="Categorias do cardápio"]');
  const offset = mobile ? 56 + (categoryNav?.offsetHeight ?? 92) + 12 : 112;
  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - offset,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
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
    const list = listRef.current;
    if (!pill || !list) return;
    list.scrollTo({
      left: pill.offsetLeft - list.offsetLeft - (list.clientWidth - pill.clientWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [active]);

  return (
    <nav aria-label="Categorias do cardápio" className="sticky top-14 z-20 -mx-4 mt-5 border-b border-line bg-paper/92 px-4 backdrop-blur-xl lg:hidden">
      <ul ref={listRef} className="scroll-x flex gap-2 py-3">
        {categories.map((category) => {
          const presentation = {
            "os-brabos": { icon: Sandwich, label: "Hambúrgueres" },
            combos: { icon: Popcorn, label: "Combos" },
            "pra-dividir": { icon: Popcorn, label: "Acomp." },
            "pra-beber": { icon: CupSoda, label: "Bebidas" },
            "doce-final": { icon: IceCreamBowl, label: category.name },
          }[category.slug];
          const Icon = presentation?.icon ?? Sandwich;
          const id = sectionId(category);
          const isActive = active === id;

          return (
            <li key={category.id} className="min-w-0 flex-[0_0_calc((100%-1.5rem)/4)]">
              <button
                type="button"
                data-target={id}
                onClick={() => scrollToSection(id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-line px-1 py-3 text-[clamp(0.5rem,2.2vw,0.625rem)] font-semibold transition-colors sm:text-xs",
                  isActive
                    ? "border-orange-400/60 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-[inset_0_1px_0_#ffffff35,0_3px_12px_#0003]"
                    : "bg-gradient-to-b from-surface to-paper text-ink-soft shadow-sm hover:bg-surface-hover",
                )}
              >
                <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
                <span className="text-center leading-tight">{presentation?.label ?? category.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Trilho vertical — composição de mesa, onde há largura sobrando à esquerda. */
export function CategoryRail({ categories }: { categories: Category[] }) {
  const ids = React.useMemo(() => categories.map(sectionId), [categories]);
  const active = useActiveSection(ids);

  return (
    <nav aria-label="Categorias" className="sticky top-28 hidden lg:block">
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
                  "relative w-full rounded-sm px-3 py-3 text-left text-base transition-colors",
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
