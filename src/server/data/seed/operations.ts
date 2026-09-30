import { effectivePriceCents } from "@/domain/catalog";
import { sumCents } from "@/domain/money";
import type { Customer, Order, OrderItem, OrderStatus, PaymentMethod, ServiceMode } from "@/domain/types";
import { SEED_STORE_ID, seedProducts } from "./catalog";

/**
 * Pedidos e clientes de demonstração, para que a área administrativa tenha
 * algo real para operar em desenvolvimento.
 *
 * Os horários são relativos ao boot do servidor — a lista de pedidos precisa
 * mostrar "há 6 min", não uma data fixa de 2024.
 */

const BOOT = Date.now();

function minutesAgo(minutes: number): string {
  return new Date(BOOT - minutes * 60_000).toISOString();
}

export const seedCustomers: Customer[] = [
  {
    id: "cus_marina",
    storeId: SEED_STORE_ID,
    name: "Marina Ferreira",
    phone: "51991234567",
    email: "marina.ferreira@example.com",
    createdAt: minutesAgo(60 * 24 * 42),
    addresses: [
      {
        id: "adr_marina_1",
        label: "Casa",
        street: "Rua Hilário Ribeiro",
        number: "202",
        complement: "Apto 71",
        district: "Moinhos de Vento",
        city: "Porto Alegre",
        state: "RS",
        zipCode: "90510-040",
        reference: "Portaria azul, ao lado da padaria",
      },
    ],
  },
  {
    id: "cus_rafael",
    storeId: SEED_STORE_ID,
    name: "Rafael Nunes",
    phone: "51988887777",
    email: null,
    createdAt: minutesAgo(60 * 24 * 12),
    addresses: [
      {
        id: "adr_rafael_1",
        label: "Trabalho",
        street: "Av. Carlos Gomes",
        number: "1340",
        complement: "Sala 903",
        district: "Boa Vista",
        city: "Porto Alegre",
        state: "RS",
        zipCode: "90480-001",
        reference: null,
      },
    ],
  },
  {
    id: "cus_bianca",
    storeId: SEED_STORE_ID,
    name: "Bianca Rocha",
    phone: "51997776655",
    email: "bianca@example.com",
    createdAt: minutesAgo(60 * 24 * 3),
    addresses: [],
  },
];

/* ------------------------------------------------------------ Itens do pedido */

interface ItemSpec {
  slug: string;
  quantity: number;
  /** Rótulos exatamente como o cliente escolheu — congelados no pedido. */
  options?: Array<[groupName: string, optionName: string, priceDeltaCents: number]>;
  note?: string;
}

let itemSeq = 0;

function buildItem(spec: ItemSpec): OrderItem {
  const product = seedProducts.find((candidate) => candidate.slug === spec.slug);
  if (!product) throw new Error(`Seed inconsistente: produto "${spec.slug}" não existe`);

  itemSeq += 1;
  const unitPriceCents = effectivePriceCents(product);
  const options = (spec.options ?? []).map(([groupName, optionName, priceDeltaCents], index) => ({
    id: `oit_${itemSeq}_${index}`,
    optionId: null,
    groupName,
    optionName,
    priceDeltaCents,
  }));

  const unitWithOptions = unitPriceCents + sumCents(options.map((option) => option.priceDeltaCents));

  return {
    id: `oi_${itemSeq}`,
    productId: product.id,
    productName: product.name,
    productImageUrl: product.imageUrl,
    quantity: spec.quantity,
    unitPriceCents,
    totalCents: unitWithOptions * spec.quantity,
    note: spec.note ?? null,
    options,
  };
}

/* ----------------------------------------------------------------- Pedidos */

interface OrderSpec {
  number: number;
  status: OrderStatus;
  mode: ServiceMode;
  customer: { id: string | null; name: string; phone: string };
  address?: Order["address"];
  payment: PaymentMethod;
  changeForCents?: number;
  minutesAgo: number;
  note?: string;
  items: ItemSpec[];
}

const DELIVERY_FEE = 799;

function buildOrder(spec: OrderSpec): Order {
  const items = spec.items.map(buildItem);
  const subtotalCents = sumCents(items.map((item) => item.totalCents));
  const deliveryFeeCents = spec.mode === "delivery" ? DELIVERY_FEE : 0;
  const createdAt = minutesAgo(spec.minutesAgo);

  return {
    id: `ord_${spec.number}`,
    storeId: SEED_STORE_ID,
    number: spec.number,
    status: spec.status,
    serviceMode: spec.mode,
    customerId: spec.customer.id,
    customerName: spec.customer.name,
    customerPhone: spec.customer.phone,
    address: spec.address ?? null,
    paymentMethod: spec.payment,
    changeForCents: spec.changeForCents ?? null,
    subtotalCents,
    deliveryFeeCents,
    discountCents: 0,
    totalCents: subtotalCents + deliveryFeeCents,
    note: spec.note ?? null,
    items,
    createdAt,
    updatedAt: createdAt,
  };
}

const MARINA_ADDRESS: Order["address"] = {
  label: "Casa",
  street: "Rua Hilário Ribeiro",
  number: "202",
  complement: "Apto 71",
  district: "Moinhos de Vento",
  city: "Porto Alegre",
  state: "RS",
  zipCode: "90510-040",
  reference: "Portaria azul, ao lado da padaria",
};

const RAFAEL_ADDRESS: Order["address"] = {
  label: "Trabalho",
  street: "Av. Carlos Gomes",
  number: "1340",
  complement: "Sala 903",
  district: "Boa Vista",
  city: "Porto Alegre",
  state: "RS",
  zipCode: "90480-001",
  reference: null,
};

export const seedOrders: Order[] = [
  buildOrder({
    number: 1042,
    status: "pending",
    mode: "delivery",
    customer: { id: "cus_marina", name: "Marina Ferreira", phone: "51991234567" },
    address: MARINA_ADDRESS,
    payment: "pix",
    minutesAgo: 3,
    items: [
      {
        slug: "smash-duplo",
        quantity: 1,
        options: [
          ["Ponto da carne", "Ao ponto", 0],
          ["Manda mais", "Bacon crocante", 600],
        ],
        note: "Sem picles, por favor",
      },
      { slug: "fritas-rusticas", quantity: 1, options: [["Molhos", "Cheddar cremoso", 500]] },
      {
        slug: "refrigerante",
        quantity: 2,
        options: [
          ["Sabor", "Guaraná", 0],
          ["Tamanho", "Lata de 350 ml", 0],
        ],
      },
    ],
  }),
  buildOrder({
    number: 1041,
    status: "pending",
    mode: "pickup",
    customer: { id: "cus_bianca", name: "Bianca Rocha", phone: "51997776655" },
    payment: "credit",
    minutesAgo: 8,
    items: [
      {
        slug: "classico-bruto",
        quantity: 2,
        options: [
          ["Tamanho", "Duplo — 2 carnes de 160 g", 1600],
          ["Ponto da carne", "Bem passada", 0],
        ],
      },
    ],
  }),
  buildOrder({
    number: 1040,
    status: "preparing",
    mode: "delivery",
    customer: { id: "cus_rafael", name: "Rafael Nunes", phone: "51988887777" },
    address: RAFAEL_ADDRESS,
    payment: "cash",
    changeForCents: 10000,
    minutesAgo: 16,
    note: "Interfone não funciona — ligar ao chegar",
    items: [
      {
        slug: "combo-bruto",
        quantity: 1,
        options: [
          ["Escolha o burger", "Bruto Bacon", 600],
          ["Escolha a bebida", "Limonada de hortelã", 300],
        ],
      },
      { slug: "onion-rings", quantity: 1 },
    ],
  }),
  buildOrder({
    number: 1039,
    status: "out_for_delivery",
    mode: "delivery",
    customer: { id: null, name: "Diego Martins", phone: "51993334444" },
    address: {
      label: null,
      street: "Rua Vieira de Castro",
      number: "88",
      complement: null,
      district: "Farroupilha",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "90040-320",
      reference: null,
    },
    payment: "debit",
    minutesAgo: 34,
    items: [
      { slug: "defumado", quantity: 1, options: [["Ponto da carne", "Ao ponto", 0]] },
      { slug: "brownie-com-sorvete", quantity: 1 },
    ],
  }),
  buildOrder({
    number: 1038,
    status: "delivered",
    mode: "delivery",
    customer: { id: "cus_marina", name: "Marina Ferreira", phone: "51991234567" },
    address: MARINA_ADDRESS,
    payment: "pix",
    minutesAgo: 95,
    items: [
      { slug: "trio-sliders", quantity: 1, options: [["Ponto da carne", "Ao ponto", 0]] },
      { slug: "milk-shake", quantity: 2, options: [["Sabor", "Ovomaltine", 400]] },
    ],
  }),
  buildOrder({
    number: 1037,
    status: "delivered",
    mode: "pickup",
    customer: { id: "cus_rafael", name: "Rafael Nunes", phone: "51988887777" },
    payment: "meal_voucher",
    minutesAgo: 140,
    items: [
      { slug: "bruto-bacon", quantity: 1, options: [["Ponto da carne", "Ao ponto para mais", 0]] },
      { slug: "fritas-parmesao", quantity: 1 },
    ],
  }),
  buildOrder({
    number: 1036,
    status: "canceled",
    mode: "delivery",
    customer: { id: null, name: "Helena Prado", phone: "51992221111" },
    address: RAFAEL_ADDRESS,
    payment: "credit",
    minutesAgo: 190,
    items: [{ slug: "picanha-na-tabua", quantity: 1 }],
  }),
];
