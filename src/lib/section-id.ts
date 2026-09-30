import type { Category } from "@/domain/types";

/** Âncora da seção no cardápio. Usada pelo servidor e pela navegação. */
export function sectionId(category: Category): string {
  return `categoria-${category.slug}`;
}
