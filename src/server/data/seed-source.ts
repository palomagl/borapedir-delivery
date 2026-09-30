import type {
  CatalogSection,
  Category,
  Customer,
  ID,
  Order,
  OrderStatus,
  Product,
} from "@/domain/types";
import { seedCategories, seedProducts, seedStore } from "./seed/catalog";
import { seedCustomers, seedOrders } from "./seed/operations";
import type { DataSource, NewOrder, OrderFilter } from "./source";

/**
 * Fonte de dados em memória, usada enquanto o Supabase não está configurado.
 *
 * Pedidos criados aqui sobrevivem ao processo do servidor de desenvolvimento,
 * o suficiente para percorrer checkout → cozinha → acompanhamento.
 */

const stores = [seedStore];

/** Mutável de propósito: é o "banco" do modo de desenvolvimento. */
const orders: Order[] = [...seedOrders];
let nextOrderNumber = Math.max(...seedOrders.map((order) => order.number)) + 1;

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const seedDataSource: DataSource = {
  async getStoreBySlug(slug) {
    return clone(stores.find((store) => store.slug === slug) ?? null);
  },

  async listStores() {
    return clone(stores);
  },

  async getCategories(storeId: ID): Promise<Category[]> {
    return clone(
      seedCategories
        .filter((category) => category.storeId === storeId && category.active)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },

  async getCatalog(storeId: ID): Promise<CatalogSection[]> {
    const categories = await this.getCategories(storeId);
    return categories.map((category) => ({
      category,
      products: clone(
        seedProducts
          .filter((product) => product.categoryId === category.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      ),
    }));
  },

  async getProductBySlug(storeId: ID, slug: string): Promise<Product | null> {
    const product = seedProducts.find(
      (candidate) => candidate.storeId === storeId && candidate.slug === slug,
    );
    return clone(product ?? null);
  },

  async getProductsByIds(storeId: ID, ids: readonly ID[]): Promise<Product[]> {
    const wanted = new Set(ids);
    return clone(
      seedProducts.filter((product) => product.storeId === storeId && wanted.has(product.id)),
    );
  },

  async setProductAvailability(storeId: ID, productId: ID, available: boolean): Promise<Product> {
    const product = seedProducts.find(
      (candidate) => candidate.storeId === storeId && candidate.id === productId,
    );
    if (!product) throw new Error("Produto não encontrado");

    product.available = available;
    return clone(product);
  },

  async listOrders(storeId: ID, filter: OrderFilter = {}): Promise<Order[]> {
    let result = orders.filter((order) => order.storeId === storeId);

    if (filter.statuses) {
      const wanted = new Set<OrderStatus>(filter.statuses);
      result = result.filter((order) => wanted.has(order.status));
    }
    if (filter.since) {
      const threshold = filter.since.getTime();
      result = result.filter((order) => new Date(order.createdAt).getTime() >= threshold);
    }

    result = result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return clone(filter.limit ? result.slice(0, filter.limit) : result);
  },

  async getOrder(storeId: ID, orderId: ID): Promise<Order | null> {
    const order = orders.find(
      (candidate) => candidate.storeId === storeId && candidate.id === orderId,
    );
    return clone(order ?? null);
  },

  async createOrder(input: NewOrder): Promise<Order> {
    const now = new Date().toISOString();
    const number = nextOrderNumber;
    nextOrderNumber += 1;

    const order: Order = {
      ...clone(input),
      id: `ord_${number}`,
      number,
      status: input.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    };

    orders.unshift(order);
    return clone(order);
  },

  async updateOrderStatus(storeId: ID, orderId: ID, status: OrderStatus): Promise<Order> {
    const order = orders.find(
      (candidate) => candidate.storeId === storeId && candidate.id === orderId,
    );
    if (!order) throw new Error("Pedido não encontrado");

    order.status = status;
    order.updatedAt = new Date().toISOString();
    return clone(order);
  },

  async listCustomers(storeId: ID): Promise<Customer[]> {
    return clone(seedCustomers.filter((customer) => customer.storeId === storeId));
  },
};
