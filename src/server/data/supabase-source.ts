import "server-only";
import type {
  CatalogSection,
  Category,
  Customer,
  ID,
  Order,
  OrderStatus,
  Product,
} from "@/domain/types";
import { publicClient, serviceClient } from "@/server/supabase/client";
import {
  ORDER_SELECT,
  PRODUCT_SELECT,
  STORE_SELECT,
  toCategory,
  toCustomer,
  toOrder,
  toProduct,
  toStore,
  type CategoryRow,
  type CustomerRow,
  type OrderRow,
  type ProductRow,
  type StoreRow,
} from "@/server/supabase/rows";
import type { DataSource, NewOrder, OrderFilter } from "./source";

/**
 * Implementação do contrato sobre Postgres.
 *
 * Catálogo usa a chave anônima e passa por RLS, que já libera leitura
 * pública. Pedido e cliente usam a service role: a loja ainda não se
 * autentica, e o pedido de convidado precisa ser lido por id. Quando a
 * autenticação entrar, essas leituras migram para a sessão do usuário e a
 * service role fica só na escrita do pedido.
 */

function fail(context: string, error: { message: string }): never {
  // Erro de banco não sobe cru para a tela; quem trata a mensagem do usuário
  // é a camada de cima. Aqui interessa deixar rastro do que falhou.
  throw new Error(`Supabase: ${context} — ${error.message}`);
}

export const supabaseDataSource: DataSource = {
  async getStoreBySlug(slug) {
    const { data, error } = await publicClient()
      .from("stores")
      .select(STORE_SELECT)
      .eq("slug", slug)
      .maybeSingle<StoreRow>();

    if (error) fail("getStoreBySlug", error);
    return data ? toStore(data) : null;
  },

  async listStores() {
    const { data, error } = await publicClient()
      .from("stores")
      .select(STORE_SELECT)
      .order("name")
      .returns<StoreRow[]>();

    if (error) fail("listStores", error);
    return (data ?? []).map(toStore);
  },

  async getCategories(storeId: ID): Promise<Category[]> {
    const { data, error } = await publicClient()
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .eq("active", true)
      .order("sort_order")
      .returns<CategoryRow[]>();

    if (error) fail("getCategories", error);
    return (data ?? []).map(toCategory);
  },

  async getCatalog(storeId: ID): Promise<CatalogSection[]> {
    // Duas consultas em paralelo em vez de uma por categoria: o cardápio
    // inteiro é pequeno e cabe numa viagem só.
    const [categories, products] = await Promise.all([
      this.getCategories(storeId),
      publicClient()
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("store_id", storeId)
        .order("sort_order")
        .returns<ProductRow[]>(),
    ]);

    if (products.error) fail("getCatalog", products.error);
    const mapped = (products.data ?? []).map(toProduct);

    return categories.map((category) => ({
      category,
      products: mapped.filter((product) => product.categoryId === category.id),
    }));
  },

  async getProductBySlug(storeId: ID, slug: string): Promise<Product | null> {
    const { data, error } = await publicClient()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("store_id", storeId)
      .eq("slug", slug)
      .maybeSingle<ProductRow>();

    if (error) fail("getProductBySlug", error);
    return data ? toProduct(data) : null;
  },

  async getProductsByIds(storeId: ID, ids: readonly ID[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const { data, error } = await publicClient()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("store_id", storeId)
      .in("id", [...ids])
      .returns<ProductRow[]>();

    if (error) fail("getProductsByIds", error);
    return (data ?? []).map(toProduct);
  },

  async setProductAvailability(storeId: ID, productId: ID, available: boolean): Promise<Product> {
    const { data, error } = await serviceClient()
      .from("products")
      .update({ available })
      .eq("store_id", storeId)
      .eq("id", productId)
      .select(PRODUCT_SELECT)
      .single<ProductRow>();

    if (error) fail("setProductAvailability", error);
    return toProduct(data);
  },

  async listOrders(storeId: ID, filter: OrderFilter = {}): Promise<Order[]> {
    let query = serviceClient()
      .from("orders")
      .select(ORDER_SELECT)
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (filter.statuses) query = query.in("status", [...filter.statuses]);
    if (filter.since) query = query.gte("created_at", filter.since.toISOString());
    if (filter.limit) query = query.limit(filter.limit);

    const { data, error } = await query.returns<OrderRow[]>();
    if (error) fail("listOrders", error);
    return (data ?? []).map(toOrder);
  },

  async getOrder(storeId: ID, orderId: ID): Promise<Order | null> {
    const { data, error } = await serviceClient()
      .from("orders")
      .select(ORDER_SELECT)
      .eq("store_id", storeId)
      .eq("id", orderId)
      .maybeSingle<OrderRow>();

    if (error) fail("getOrder", error);
    return data ? toOrder(data) : null;
  },

  /**
   * Grava o pedido em três passos: cabeçalho, itens, opções dos itens.
   *
   * Sem transação porque o supabase-js não expõe uma; se um passo falhar, o
   * cabeçalho já criado é apagado para não deixar pedido pela metade na
   * cozinha. Quando isso apertar, vira uma função no Postgres.
   */
  async createOrder(input: NewOrder): Promise<Order> {
    const client = serviceClient();
    const address = input.address;

    const { data: created, error: orderError } = await client
      .from("orders")
      .insert({
        store_id: input.storeId,
        status: input.status ?? "pending",
        service_mode: input.serviceMode,
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        address_label: address?.label ?? null,
        address_street: address?.street ?? null,
        address_number: address?.number ?? null,
        address_complement: address?.complement ?? null,
        address_district: address?.district ?? null,
        address_city: address?.city ?? null,
        address_state: address?.state ?? null,
        address_zip_code: address?.zipCode ?? null,
        address_reference: address?.reference ?? null,
        payment_method: input.paymentMethod,
        change_for_cents: input.changeForCents,
        subtotal_cents: input.subtotalCents,
        delivery_fee_cents: input.deliveryFeeCents,
        discount_cents: input.discountCents,
        total_cents: input.totalCents,
        note: input.note,
      })
      .select("id")
      .single<{ id: string }>();

    if (orderError) fail("createOrder", orderError);

    try {
      const { data: items, error: itemsError } = await client
        .from("order_items")
        .insert(
          input.items.map((item, index) => ({
            store_id: input.storeId,
            order_id: created.id,
            product_id: item.productId,
            product_name: item.productName,
            product_image_url: item.productImageUrl,
            quantity: item.quantity,
            unit_price_cents: item.unitPriceCents,
            total_cents: item.totalCents,
            note: item.note,
            sort_order: index,
          })),
        )
        .select("id")
        .returns<{ id: string }[]>();

      if (itemsError) fail("createOrder.items", itemsError);

      const optionRows = input.items.flatMap((item, itemIndex) =>
        item.options.map((option, optionIndex) => ({
          store_id: input.storeId,
          order_item_id: items[itemIndex].id,
          option_id: option.optionId,
          group_name: option.groupName,
          option_name: option.optionName,
          price_delta_cents: option.priceDeltaCents,
          sort_order: optionIndex,
        })),
      );

      if (optionRows.length > 0) {
        const { error: optionsError } = await client.from("order_item_options").insert(optionRows);
        if (optionsError) fail("createOrder.options", optionsError);
      }
    } catch (error) {
      await client.from("orders").delete().eq("id", created.id);
      throw error;
    }

    const order = await this.getOrder(input.storeId, created.id);
    if (!order) throw new Error("Supabase: pedido criado mas não encontrado na releitura");
    return order;
  },

  async updateOrderStatus(storeId: ID, orderId: ID, status: OrderStatus): Promise<Order> {
    const { error } = await serviceClient()
      .from("orders")
      .update({ status })
      .eq("store_id", storeId)
      .eq("id", orderId);

    if (error) fail("updateOrderStatus", error);

    const order = await this.getOrder(storeId, orderId);
    if (!order) throw new Error("Pedido não encontrado");
    return order;
  },

  async listCustomers(storeId: ID): Promise<Customer[]> {
    const { data, error } = await serviceClient()
      .from("customers")
      .select("*, customer_addresses (*)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .returns<CustomerRow[]>();

    if (error) fail("listCustomers", error);
    return (data ?? []).map(toCustomer);
  },
};
