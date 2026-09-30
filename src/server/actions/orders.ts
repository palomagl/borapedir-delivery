"use server";

import { revalidatePath } from "next/cache";
import { effectivePriceCents, isStoreOpen } from "@/domain/catalog";
import { parseToCents, sumCents } from "@/domain/money";
import { canTransition } from "@/domain/order";
import { checkoutSchema } from "@/domain/schemas";
import type { Order, OrderItem, OrderStatus, Product } from "@/domain/types";
import { getDataSource, type NewOrder } from "@/server/data";
import type { ActionResult } from "@/server/actions/result";

/**
 * Criação de pedido.
 *
 * O cliente manda só o que escolheu: ids de produto e de opção. Todo preço é
 * recalculado aqui contra o catálogo. Aceitar o total que o navegador enviou
 * seria deixar o navegador definir quanto pagar.
 */
export async function createOrder(
  storeSlug: string,
  raw: unknown,
): Promise<ActionResult<{ orderId: string; orderNumber: number }>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ok: false, error: "Revise os dados do pedido.", fieldErrors };
  }

  const input = parsed.data;
  const source = getDataSource();

  const store = await source.getStoreBySlug(storeSlug);
  if (!store) return { ok: false, error: "Loja não encontrada." };

  if (!isStoreOpen(store)) {
    return { ok: false, error: "A loja está fechada e não está recebendo pedidos agora." };
  }
  if (!store.serviceModes.includes(input.serviceMode)) {
    return { ok: false, error: "Esta loja não atende nessa modalidade." };
  }
  if (!store.paymentMethods.includes(input.paymentMethod)) {
    return { ok: false, error: "Forma de pagamento indisponível." };
  }

  const products = await source.getProductsByIds(
    store.id,
    input.items.map((item) => item.productId),
  );
  const byId = new Map(products.map((product) => [product.id, product]));

  const items: OrderItem[] = [];

  for (const [index, item] of input.items.entries()) {
    const product = byId.get(item.productId);
    if (!product) return { ok: false, error: "Um item da sacola não existe mais no cardápio." };
    if (!product.available) {
      return { ok: false, error: `${product.name} não está disponível no momento.` };
    }

    const built = buildOrderItem(product, item.optionIds, item.quantity, item.note ?? null, index);
    if ("error" in built) return { ok: false, error: built.error };
    items.push(built.item);
  }

  const subtotalCents = sumCents(items.map((item) => item.totalCents));
  const deliveryFeeCents = input.serviceMode === "delivery" ? store.deliveryFeeCents : 0;

  if (input.serviceMode === "delivery" && subtotalCents < store.minOrderCents) {
    return { ok: false, error: "O pedido não atinge o valor mínimo para entrega." };
  }

  const changeForCents =
    input.paymentMethod === "cash" && input.changeFor ? parseToCents(input.changeFor) : null;

  const totalCents = subtotalCents + deliveryFeeCents;

  if (changeForCents !== null && changeForCents > 0 && changeForCents < totalCents) {
    return {
      ok: false,
      error: "O valor para troco é menor que o total do pedido.",
      fieldErrors: { changeFor: "Informe um valor maior que o total" },
    };
  }

  const newOrder: NewOrder = {
    storeId: store.id,
    serviceMode: input.serviceMode,
    customerId: null,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    address:
      input.serviceMode === "delivery" && input.address
        ? {
            label: input.address.label ?? null,
            street: input.address.street,
            number: input.address.number,
            complement: input.address.complement ?? null,
            district: input.address.district,
            city: input.address.city,
            state: input.address.state,
            zipCode: input.address.zipCode || null,
            reference: input.address.reference ?? null,
          }
        : null,
    paymentMethod: input.paymentMethod,
    changeForCents: changeForCents && changeForCents > 0 ? changeForCents : null,
    subtotalCents,
    deliveryFeeCents,
    discountCents: 0,
    totalCents,
    note: input.note ?? null,
    items,
  };

  const order = await source.createOrder(newOrder);

  revalidatePath(`/${storeSlug}/pedidos`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");

  return { ok: true, data: { orderId: order.id, orderNumber: order.number } };
}

/** Monta o item já congelado: nomes e preços saem do catálogo, não do cliente. */
function buildOrderItem(
  product: Product,
  optionIds: readonly string[],
  quantity: number,
  note: string | null,
  index: number,
): { item: OrderItem } | { error: string } {
  const chosen = new Set(optionIds);
  const options: OrderItem["options"] = [];

  for (const group of product.optionGroups) {
    const picked = group.options.filter((option) => chosen.has(option.id));

    if (picked.some((option) => !option.available)) {
      return { error: `Uma opção de ${product.name} acabou. Escolha novamente.` };
    }
    if (picked.length < group.minSelect) {
      return { error: `Escolha as opções obrigatórias de ${product.name}.` };
    }
    if (picked.length > group.maxSelect) {
      return { error: `Opções demais em ${product.name}.` };
    }

    for (const option of picked) {
      options.push({
        id: `${product.id}_${option.id}`,
        optionId: option.id,
        groupName: group.name,
        optionName: option.name,
        priceDeltaCents: option.priceDeltaCents,
      });
      chosen.delete(option.id);
    }
  }

  // Sobrou id que não pertence a nenhum grupo deste produto.
  if (chosen.size > 0) return { error: `Opção inválida em ${product.name}.` };

  const unitPriceCents = effectivePriceCents(product);
  const unitWithOptions = unitPriceCents + sumCents(options.map((option) => option.priceDeltaCents));

  return {
    item: {
      id: `${product.id}_${index}`,
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      quantity,
      unitPriceCents,
      totalCents: unitWithOptions * quantity,
      note,
      options,
    },
  };
}

/**
 * Pedidos de um cliente sem conta, consultados pelos ids que o navegador dele
 * guardou. Só devolve o que pertence a esta loja.
 */
export async function getOrdersByIds(storeSlug: string, ids: string[]): Promise<Order[]> {
  if (ids.length === 0) return [];

  const source = getDataSource();
  const store = await source.getStoreBySlug(storeSlug);
  if (!store) return [];

  const found = await Promise.all(ids.slice(0, 30).map((id) => source.getOrder(store.id, id)));

  return found
    .filter((order): order is Order => order !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/* ------------------------------------------------------- Operação da loja */

export async function advanceOrderStatus(
  storeId: string,
  orderId: string,
  status: OrderStatus,
): Promise<ActionResult<Order>> {
  const source = getDataSource();
  const current = await source.getOrder(storeId, orderId);
  if (!current) return { ok: false, error: "Pedido não encontrado." };

  if (!canTransition(current.status, status)) {
    return { ok: false, error: "Essa mudança de status não é permitida." };
  }

  const updated = await source.updateOrderStatus(storeId, orderId, status);

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");

  return { ok: true, data: updated };
}
