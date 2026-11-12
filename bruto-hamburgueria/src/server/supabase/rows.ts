import type {
  Category,
  OpeningHour,
  OptionGroup,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  ProductOption,
  ServiceMode,
  Store,
} from "@/domain/types";

/**
 * As linhas do banco, exatamente como as migrations as definem, e as funções
 * que as traduzem para o domínio.
 *
 * Ter esta fronteira escrita à mão — em vez de espalhar `any` pelas consultas
 * — é o que faz o TypeScript avisar quando uma coluna some ou muda de nome.
 */

export interface StoreRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  headline: string | null;
  logo_url: string | null;
  cover_url: string | null;
  brand_color: string;
  brand_contrast_color: string;
  phone: string | null;
  address: string | null;
  service_modes: ServiceMode[];
  delivery_fee_cents: number;
  min_order_cents: number;
  delivery_eta_min: number;
  delivery_eta_max: number;
  pickup_eta_min: number;
  pickup_eta_max: number;
  payment_methods: PaymentMethod[];
  accepting_orders: boolean;
  store_opening_hours?: OpeningHourRow[] | null;
}

export interface OpeningHourRow {
  weekday: number;
  opens_at: string;
  closes_at: string;
}

export interface CategoryRow {
  id: string;
  store_id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  sort_order: number;
  active: boolean;
}

export interface OptionRow {
  id: string;
  group_id: string;
  name: string;
  price_delta_cents: number;
  available: boolean;
  sort_order: number;
}

export interface OptionGroupRow {
  id: string;
  product_id: string;
  name: string;
  helper_text: string | null;
  min_select: number;
  max_select: number;
  sort_order: number;
  options?: OptionRow[] | null;
}

export interface ProductRow {
  id: string;
  store_id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  promo_price_cents: number | null;
  available: boolean;
  featured: boolean;
  sort_order: number;
  option_groups?: OptionGroupRow[] | null;
}

export interface OrderItemOptionRow {
  id: string;
  option_id: string | null;
  group_name: string;
  option_name: string;
  price_delta_cents: number;
  sort_order: number;
}

export interface OrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  note: string | null;
  sort_order: number;
  order_item_options?: OrderItemOptionRow[] | null;
}

export interface OrderRow {
  id: string;
  store_id: string;
  number: number;
  status: Order["status"];
  service_mode: ServiceMode;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  address_label: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  address_reference: string | null;
  payment_method: PaymentMethod;
  change_for_cents: number | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[] | null;
}

export interface CustomerAddressRow {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zip_code: string | null;
  reference: string | null;
}

export interface CustomerRow {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  customer_addresses?: CustomerAddressRow[] | null;
}

/* ------------------------------------------------------------- Tradução */

function bySortOrder<T extends { sort_order: number }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

export function toStore(row: StoreRow): Store {
  const hours: OpeningHour[] = (row.store_opening_hours ?? []).map((hour) => ({
    weekday: hour.weekday,
    // Postgres devolve "18:00:00"; o domínio trabalha com "18:00".
    opensAt: hour.opens_at.slice(0, 5),
    closesAt: hour.closes_at.slice(0, 5),
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    headline: row.headline,
    logoUrl: row.logo_url,
    coverUrl: row.cover_url,
    theme: { brand: row.brand_color, brandContrast: row.brand_contrast_color },
    phone: row.phone,
    address: row.address,
    serviceModes: row.service_modes,
    deliveryFeeCents: row.delivery_fee_cents,
    minOrderCents: row.min_order_cents,
    deliveryEtaMinutes: [row.delivery_eta_min, row.delivery_eta_max],
    pickupEtaMinutes: [row.pickup_eta_min, row.pickup_eta_max],
    paymentMethods: row.payment_methods,
    openingHours: hours,
    acceptingOrders: row.accepting_orders,
  };
}

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    storeId: row.store_id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function toOption(row: OptionRow): ProductOption {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    priceDeltaCents: row.price_delta_cents,
    available: row.available,
    sortOrder: row.sort_order,
  };
}

function toOptionGroup(row: OptionGroupRow): OptionGroup {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    helperText: row.helper_text,
    minSelect: row.min_select,
    maxSelect: row.max_select,
    sortOrder: row.sort_order,
    options: bySortOrder(row.options ?? []).map(toOption),
  };
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    categoryId: row.category_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    priceCents: row.price_cents,
    promoPriceCents: row.promo_price_cents,
    available: row.available,
    featured: row.featured,
    sortOrder: row.sort_order,
    optionGroups: bySortOrder(row.option_groups ?? []).map(toOptionGroup),
  };
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productImageUrl: row.product_image_url,
    quantity: row.quantity,
    unitPriceCents: row.unit_price_cents,
    totalCents: row.total_cents,
    note: row.note,
    options: bySortOrder(row.order_item_options ?? []).map((option) => ({
      id: option.id,
      optionId: option.option_id,
      groupName: option.group_name,
      optionName: option.option_name,
      priceDeltaCents: option.price_delta_cents,
    })),
  };
}

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    storeId: row.store_id,
    number: row.number,
    status: row.status,
    serviceMode: row.service_mode,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address:
      row.address_street && row.address_number
        ? {
            label: row.address_label,
            street: row.address_street,
            number: row.address_number,
            complement: row.address_complement,
            district: row.address_district ?? "",
            city: row.address_city ?? "",
            state: row.address_state ?? "",
            zipCode: row.address_zip_code,
            reference: row.address_reference,
          }
        : null,
    paymentMethod: row.payment_method,
    changeForCents: row.change_for_cents,
    subtotalCents: row.subtotal_cents,
    deliveryFeeCents: row.delivery_fee_cents,
    discountCents: row.discount_cents,
    totalCents: row.total_cents,
    note: row.note,
    items: bySortOrder(row.order_items ?? []).map(toOrderItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCustomer(row: CustomerRow) {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
    addresses: (row.customer_addresses ?? []).map((address) => ({
      id: address.id,
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      reference: address.reference,
    })),
  };
}

/* ------------------------------------------------- Consultas reaproveitadas */

/** Loja com os horários, que nunca são úteis separados dela. */
export const STORE_SELECT = "*, store_opening_hours (weekday, opens_at, closes_at)";

/** Produto com grupos e opções, para o cardápio sair em uma consulta só. */
export const PRODUCT_SELECT =
  "*, option_groups (*, options (*))";

/** Pedido com itens e as opções de cada item. */
export const ORDER_SELECT =
  "*, order_items (*, order_item_options (*))";
