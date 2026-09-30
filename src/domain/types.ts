/**
 * Modelo de domínio do Bora pedir.
 *
 * Duas regras que atravessam tudo:
 *  1. Dinheiro é sempre inteiro em centavos. Nunca float.
 *  2. Pedido é imutável: ele guarda o preço e o nome do momento da compra,
 *     não uma referência viva ao produto.
 */

export type ID = string;

/* ------------------------------------------------------------------ Loja */

export type ServiceMode = "delivery" | "pickup";

export interface OpeningHour {
  /** 0 = domingo … 6 = sábado */
  weekday: number;
  /** "18:30" */
  opensAt: string;
  closesAt: string;
}

export interface StoreTheme {
  /** Cor de ação da loja, em OKLCH ou hex. Cai no laranja-brasa se ausente. */
  brand: string;
  brandContrast: string;
}

export interface Store {
  id: ID;
  slug: string;
  name: string;
  /** Linha de apoio do logotipo: "Burger & Chapa". */
  tagline: string | null;
  /** Frase de campanha, usada no topo da loja. */
  headline: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  theme: StoreTheme;
  phone: string | null;
  address: string | null;
  serviceModes: ServiceMode[];
  deliveryFeeCents: number;
  /** Pedido mínimo para entrega. 0 = sem mínimo. */
  minOrderCents: number;
  /** Estimativa exibida ao cliente, em minutos. */
  deliveryEtaMinutes: [number, number];
  pickupEtaMinutes: [number, number];
  paymentMethods: PaymentMethod[];
  openingHours: OpeningHour[];
  /** Fecha a loja manualmente, independente do horário. */
  acceptingOrders: boolean;
}

export type PaymentMethod = "pix" | "credit" | "debit" | "cash" | "meal_voucher";

/* --------------------------------------------------------------- Catálogo */

export interface Category {
  id: ID;
  storeId: ID;
  slug: string;
  name: string;
  /** Uma linha que diz o que há nesta categoria. Opcional. */
  subtitle: string | null;
  sortOrder: number;
  active: boolean;
}

/**
 * Um grupo cobre variação E adicional — a diferença é só a cardinalidade.
 *   Tamanho:    min 1, max 1  → escolha obrigatória, radio
 *   Adicionais: min 0, max 5  → opcional, checkbox
 */
export interface OptionGroup {
  id: ID;
  productId: ID;
  name: string;
  /** Texto curto de apoio ("Escolha até 3"). Derivado se ausente. */
  helperText: string | null;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: ProductOption[];
}

export interface ProductOption {
  id: ID;
  groupId: ID;
  name: string;
  /** Pode ser negativo (ex.: "sem queijo −R$ 2"). */
  priceDeltaCents: number;
  available: boolean;
  sortOrder: number;
}

export interface Product {
  id: ID;
  storeId: ID;
  categoryId: ID;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  /** Quando presente e menor que priceCents, é o preço cobrado. */
  promoPriceCents: number | null;
  available: boolean;
  featured: boolean;
  sortOrder: number;
  optionGroups: OptionGroup[];
}

/** Produto + sua categoria, agrupado para renderizar o cardápio. */
export interface CatalogSection {
  category: Category;
  products: Product[];
}

/* ---------------------------------------------------------------- Cliente */

export interface Address {
  id: ID;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string | null;
  reference: string | null;
}

export interface Customer {
  id: ID;
  storeId: ID;
  name: string;
  phone: string;
  email: string | null;
  addresses: Address[];
  createdAt: string;
}

/* ---------------------------------------------------------------- Pedidos */

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "canceled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Opção escolhida, congelada no momento da compra. */
export interface OrderItemOption {
  id: ID;
  optionId: ID | null;
  groupName: string;
  optionName: string;
  priceDeltaCents: number;
}

export interface OrderItem {
  id: ID;
  productId: ID | null;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  /** Preço unitário do produto, sem adicionais, como estava na compra. */
  unitPriceCents: number;
  /** unitPriceCents + soma dos deltas, × quantity. */
  totalCents: number;
  note: string | null;
  options: OrderItemOption[];
}

export interface Order {
  id: ID;
  storeId: ID;
  /** Sequencial por loja, exibido ao cliente e à cozinha. */
  number: number;
  status: OrderStatus;
  serviceMode: ServiceMode;
  customerId: ID | null;
  customerName: string;
  customerPhone: string;
  /** Endereço congelado; null em retirada. */
  address: Omit<Address, "id"> | null;
  paymentMethod: PaymentMethod;
  /** Troco para: valor em centavos que o cliente vai entregar. */
  changeForCents: number | null;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  note: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
