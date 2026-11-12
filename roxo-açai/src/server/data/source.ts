import type {
  CatalogSection,
  Category,
  Customer,
  ID,
  Order,
  OrderStatus,
  Product,
  Store,
} from "@/domain/types";

/**
 * Contrato único de acesso a dados.
 *
 * A UI nunca importa Supabase nem o seed diretamente — importa daqui.
 * Trocar de fonte é trocar a implementação, não as telas.
 */
export interface DataSource {
  getStoreBySlug(slug: string): Promise<Store | null>;
  listStores(): Promise<Store[]>;

  getCategories(storeId: ID): Promise<Category[]>;
  /** Catálogo completo já agrupado e ordenado, pronto para renderizar. */
  getCatalog(storeId: ID): Promise<CatalogSection[]>;
  getProductBySlug(storeId: ID, slug: string): Promise<Product | null>;
  getProductsByIds(storeId: ID, ids: readonly ID[]): Promise<Product[]>;

  /** Esgotar e reativar item é a operação mais frequente do balcão. */
  setProductAvailability(storeId: ID, productId: ID, available: boolean): Promise<Product>;

  /** Cria quando não há id, atualiza quando há. Não mexe nos grupos de opção. */
  saveProduct(storeId: ID, input: SaveProductInput): Promise<Product>;

  listOrders(storeId: ID, filter?: OrderFilter): Promise<Order[]>;
  getOrder(storeId: ID, orderId: ID): Promise<Order | null>;
  createOrder(input: NewOrder): Promise<Order>;
  updateOrderStatus(storeId: ID, orderId: ID, status: OrderStatus): Promise<Order>;

  listCustomers(storeId: ID): Promise<Customer[]>;
}

export interface SaveProductInput {
  id?: ID;
  categoryId: ID;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  promoPriceCents: number | null;
  available: boolean;
  featured: boolean;
}

export interface OrderFilter {
  statuses?: readonly OrderStatus[];
  /** Limita aos pedidos criados a partir deste instante. */
  since?: Date;
  limit?: number;
}

/** Pedido pronto para gravar: já validado e com preços congelados. */
export type NewOrder = Omit<Order, "id" | "number" | "createdAt" | "updatedAt" | "status"> & {
  status?: OrderStatus;
};
