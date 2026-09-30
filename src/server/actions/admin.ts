"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "@/server/data";
import type { ActionResult } from "@/server/actions/result";

/**
 * Esgotar e reativar item.
 *
 * É a operação que a loja mais repete no dia: acabou o bacon, some do
 * cardápio; chegou a reposição, volta. Precisa ser um toque, sem formulário.
 */
export async function setProductAvailability(
  storeSlug: string,
  productId: string,
  available: boolean,
): Promise<ActionResult<{ available: boolean }>> {
  const source = getDataSource();

  const store = await source.getStoreBySlug(storeSlug);
  if (!store) return { ok: false, error: "Loja não encontrada." };

  try {
    const product = await source.setProductAvailability(store.id, productId, available);

    // O cardápio do cliente e a lista do admin precisam refletir na hora.
    revalidatePath(`/${storeSlug}`, "layout");
    revalidatePath(`/admin/${storeSlug}/produtos`);

    return { ok: true, data: { available: product.available } };
  } catch {
    return { ok: false, error: "Não foi possível atualizar o produto." };
  }
}
