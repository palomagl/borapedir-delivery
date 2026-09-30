"use server";

import { revalidatePath } from "next/cache";
import { productSchema } from "@/domain/schemas";
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

/**
 * Cria ou atualiza um produto.
 *
 * A validação é a mesma do formulário — um schema só, rodando de novo aqui,
 * porque o que chega numa server action é entrada de rede como qualquer outra.
 */
export async function saveProduct(
  storeSlug: string,
  raw: unknown,
): Promise<ActionResult<{ productId: string; slug: string }>> {
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ok: false, error: "Revise os campos do produto.", fieldErrors };
  }

  const input = parsed.data;
  const source = getDataSource();

  const store = await source.getStoreBySlug(storeSlug);
  if (!store) return { ok: false, error: "Loja não encontrada." };

  const categories = await source.getCategories(store.id);
  if (!categories.some((category) => category.id === input.categoryId)) {
    return {
      ok: false,
      error: "Categoria inválida.",
      fieldErrors: { categoryId: "Escolha uma categoria desta loja" },
    };
  }

  try {
    const product = await source.saveProduct(store.id, {
      id: input.id,
      categoryId: input.categoryId,
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      priceCents: input.priceCents,
      promoPriceCents: input.promoPriceCents,
      available: input.available,
      featured: input.featured,
    });

    revalidatePath(`/${storeSlug}`, "layout");
    revalidatePath(`/admin/${storeSlug}/produtos`);

    return { ok: true, data: { productId: product.id, slug: product.slug } };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("endereço")
        ? error.message
        : "Não foi possível salvar o produto.";

    return { ok: false, error: message, fieldErrors: { slug: message } };
  }
}
