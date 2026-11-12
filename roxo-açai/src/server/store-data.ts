import { cache } from "react";
import { getDataSource } from "@/server/data";

/**
 * O layout e a página pedem a mesma loja no mesmo render. `cache` garante uma
 * consulta só por requisição — importante assim que a fonte virar banco.
 */
export const loadStore = cache(async (slug: string) => {
  return getDataSource().getStoreBySlug(slug);
});

export const loadCatalog = cache(async (storeId: string) => {
  return getDataSource().getCatalog(storeId);
});
