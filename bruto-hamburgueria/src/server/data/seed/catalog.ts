import type { Category, OptionGroup, Product, ProductOption, Store } from "@/domain/types";

/**
 * Cardápio da BRUTO.
 *
 * Dados de desenvolvimento no mesmo formato que o Supabase devolve, para que
 * a interface nunca saiba de qual fonte veio.
 */

const STORE_ID = "str_bruto";

/* ------------------------------------------------------------- Construtores */

type OptionSpec =
  | [name: string, priceDeltaCents: number]
  | [name: string, priceDeltaCents: number, available: false];

interface GroupSpec {
  id: string;
  name: string;
  min: number;
  max: number;
  helper?: string;
  options: OptionSpec[];
}

function buildGroup(productId: string, spec: GroupSpec, sortOrder: number): OptionGroup {
  const options: ProductOption[] = spec.options.map(([name, priceDeltaCents, available], index) => ({
    id: `${spec.id}_${index + 1}`,
    groupId: spec.id,
    name,
    priceDeltaCents,
    available: available !== false,
    sortOrder: index,
  }));

  return {
    id: spec.id,
    productId,
    name: spec.name,
    helperText: spec.helper ?? null,
    minSelect: spec.min,
    maxSelect: spec.max,
    sortOrder,
    options,
  };
}

interface ProductSpec {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  promoPriceCents?: number;
  featured?: boolean;
  available?: boolean;
  groups?: GroupSpec[];
}

function buildProduct(categoryId: string, spec: ProductSpec, sortOrder: number): Product {
  const id = `prd_${spec.slug}`;
  return {
    id,
    storeId: STORE_ID,
    categoryId,
    slug: spec.slug,
    name: spec.name,
    description: spec.description,
    // O arquivo da foto sempre tem o nome do slug. Um campo a menos para
    // sair de sincronia quando alguém renomeia um produto.
    imageUrl: `/seed/${spec.slug}.jpg`,
    priceCents: spec.priceCents,
    promoPriceCents: spec.promoPriceCents ?? null,
    available: spec.available !== false,
    featured: spec.featured === true,
    sortOrder,
    optionGroups: (spec.groups ?? []).map((group, index) => buildGroup(id, group, index)),
  };
}

/* ------------------------------------------ Grupos reaproveitados no cardápio */

const pontoDaCarne = (id: string): GroupSpec => ({
  id: `grp_${id}_ponto`,
  name: "Ponto da carne",
  min: 1,
  max: 1,
  options: [
    ["Ao ponto", 0],
    ["Ao ponto para mais", 0],
    ["Bem passada", 0],
  ],
});

const adicionais = (id: string): GroupSpec => ({
  id: `grp_${id}_add`,
  name: "Manda mais",
  min: 0,
  max: 5,
  helper: "Escolha até 5 adicionais",
  options: [
    ["Bacon crocante", 600],
    ["Cheddar extra", 500],
    ["Ovo frito", 350],
    ["Cebola caramelizada", 400],
    ["Picles da casa", 250],
    ["Molho bruto extra", 300],
  ],
});

const tamanho = (id: string): GroupSpec => ({
  id: `grp_${id}_tam`,
  name: "Tamanho",
  min: 1,
  max: 1,
  options: [
    ["Simples — 1 carne de 160 g", 0],
    ["Duplo — 2 carnes de 160 g", 1600],
    ["Triplo — 3 carnes de 160 g", 2900],
  ],
});

/* ------------------------------------------------------------------ Categorias */

export const seedCategories: Category[] = [
  {
    id: "cat_smash",
    storeId: STORE_ID,
    slug: "os-brabos",
    name: "Os brabos",
    subtitle: "Hambúrgueres feitos com carne de verdade",
    sortOrder: 0,
    active: true,
  },
  {
    id: "cat_combos",
    storeId: STORE_ID,
    slug: "combos",
    name: "Combos",
    subtitle: "Burger, acompanhamento e bebida",
    sortOrder: 1,
    active: true,
  },
  {
    id: "cat_porcoes",
    storeId: STORE_ID,
    slug: "pra-dividir",
    name: "Pra dividir",
    subtitle: "Porções que aguentam a mesa inteira",
    sortOrder: 2,
    active: true,
  },
  {
    id: "cat_bebidas",
    storeId: STORE_ID,
    slug: "pra-beber",
    name: "Pra beber",
    subtitle: "Gelado, do jeito que tem que ser",
    sortOrder: 3,
    active: true,
  },
  {
    id: "cat_sobremesas",
    storeId: STORE_ID,
    slug: "doce-final",
    name: "Doce final",
    subtitle: "Porque ninguém sai daqui com fome",
    sortOrder: 4,
    active: true,
  },
];

/* -------------------------------------------------------------------- Produtos */

const brabos: ProductSpec[] = [
  {
    slug: "bruto-bacon",
    name: "Bruto Bacon",
    description: "Blend de 160 g, bacon em tiras crocantes, cheddar inglês, cebola crispy e molho bruto.",
    priceCents: 3890,
    featured: true,
    groups: [tamanho("bacon"), pontoDaCarne("bacon"), adicionais("bacon")],
  },
  {
    slug: "smash-duplo",
    name: "Smash Duplo",
    description: "Duas carnes prensadas na chapa, cheddar derretido em duas camadas, picles e maionese defumada.",
    priceCents: 4190,
    promoPriceCents: 3690,
    featured: true,
    groups: [pontoDaCarne("smash"), adicionais("smash")],
  },
  {
    slug: "classico-bruto",
    name: "Clássico Bruto",
    description: "Pão brioche tostado na manteiga, blend de 160 g, queijo prato, alface, tomate e molho da casa.",
    priceCents: 3290,
    featured: true,
    groups: [tamanho("classico"), pontoDaCarne("classico"), adicionais("classico")],
  },
  {
    slug: "bbq-na-chapa",
    name: "BBQ na Chapa",
    description:
      "Duas carnes de 160 g, cheddar derretido, bacon, alface e barbecue defumado da casa.",
    priceCents: 3490,
    groups: [pontoDaCarne("bbq"), adicionais("bbq")],
  },
  {
    slug: "defumado",
    name: "Defumado",
    description: "Pão de beterraba, blend maturado de 180 g, queijo brie, rúcula e geleia de pimenta.",
    priceCents: 4490,
    featured: true,
    groups: [pontoDaCarne("defumado"), adicionais("defumado")],
  },
  {
    slug: "salada-da-casa",
    name: "Salada da Casa",
    description:
      "Pão de gergelim, blend de 160 g, cheddar, alface americana, tomate e maionese da casa.",
    priceCents: 3690,
    groups: [pontoDaCarne("rustico"), adicionais("rustico")],
  },
];

const combos: ProductSpec[] = [
  {
    slug: "combo-bruto",
    name: "Combo Bruto",
    description: "Um burger à sua escolha, fritas rústicas individuais e bebida de 350 ml.",
    priceCents: 4590,
    featured: true,
    groups: [
      {
        id: "grp_combo_burger",
        name: "Escolha o burger",
        min: 1,
        max: 1,
        options: [
          ["Clássico Bruto", 0],
          ["Frango Crocante", 0],
          ["Salada da Casa", 200],
          ["BBQ na Chapa", 300],
          ["Bruto Bacon", 600],
          ["Smash Duplo", 900],
        ],
      },
      {
        id: "grp_combo_bebida",
        name: "Escolha a bebida",
        min: 1,
        max: 1,
        options: [
          ["Refrigerante lata", 0],
          ["Limonada de hortelã", 300],
          ["Milk shake de 300 ml", 900],
        ],
      },
      adicionais("combo"),
    ],
  },
  {
    slug: "trio-sliders",
    name: "Trio de Sliders",
    description: "Três mini burgers de 90 g — clássico, bacon e cheddar — servidos sobre as fritas.",
    priceCents: 5290,
    groups: [pontoDaCarne("sliders")],
  },
];

const porcoes: ProductSpec[] = [
  {
    slug: "fritas-rusticas",
    name: "Fritas Rústicas",
    description: "Batata crocante com sal e ervas, servida na cesta com molho da casa. Serve duas pessoas.",
    priceCents: 1990,
    groups: [
      {
        id: "grp_fritas_molho",
        name: "Molhos",
        min: 0,
        max: 3,
        helper: "Escolha até 3",
        options: [
          ["Barbecue defumado", 300],
          ["Cheddar cremoso", 500],
          ["Maionese da casa", 250],
          ["Molho de alho", 250],
        ],
      },
    ],
  },
  {
    slug: "fritas-parmesao",
    name: "Fritas com Parmesão",
    description: "Batata frita finalizada com parmesão ralado na hora, alho confitado e salsa.",
    priceCents: 2690,
  },
  {
    slug: "onion-rings",
    name: "Onion Rings",
    description: "Anéis de cebola empanados na cerveja, crocantes por fora e macios por dentro.",
    priceCents: 2490,
  },
  {
    slug: "picanha-na-tabua",
    name: "Picanha na Tábua",
    description: "Picanha fatiada na chapa, farofa de bacon e pão de alho. Serve três pessoas.",
    priceCents: 8990,
  },
];

const bebidas: ProductSpec[] = [
  {
    slug: "refrigerante",
    name: "Refrigerante",
    description: "Lata gelada de 350 ml ou garrafa de 600 ml.",
    priceCents: 890,
    groups: [
      {
        id: "grp_refri_sabor",
        name: "Sabor",
        min: 1,
        max: 1,
        options: [
          ["Cola", 0],
          ["Guaraná", 0],
          ["Laranja", 0],
          ["Limão", 0],
          ["Cola sem açúcar", 0],
        ],
      },
      {
        id: "grp_refri_tam",
        name: "Tamanho",
        min: 1,
        max: 1,
        options: [
          ["Lata de 350 ml", 0],
          ["Garrafa de 600 ml", 400],
        ],
      },
    ],
  },
  {
    slug: "agua",
    name: "Água",
    description: "Mineral, 500 ml. Gelada.",
    priceCents: 590,
    groups: [
      {
        id: "grp_agua_tipo",
        name: "Tipo",
        min: 1,
        max: 1,
        options: [
          ["Sem gás", 0],
          ["Com gás", 100],
        ],
      },
    ],
  },
  {
    slug: "limonada",
    name: "Limonada com Alecrim",
    description: "Limão siciliano, alecrim fresco e muito gelo, 500 ml. Feita na hora.",
    priceCents: 1290,
  },
  {
    slug: "drink-da-casa",
    name: "Drink da Casa",
    description: "Destilado, laranja desidratada e gelo de pedra. Servido no copo baixo.",
    priceCents: 2690,
    featured: true,
    groups: [
      {
        id: "grp_drink_base",
        name: "Escolha a base",
        min: 1,
        max: 1,
        options: [
          ["Whisky e laranja", 0],
          ["Gin e tônica", 0],
          ["Rum e limão", 0],
          ["Sem álcool", -400],
        ],
      },
    ],
  },
  {
    slug: "milk-shake",
    name: "Milk Shake",
    description: "Sorvete batido com leite, 400 ml, com calda e cobertura crocante.",
    priceCents: 2190,
    groups: [
      {
        id: "grp_shake_sabor",
        name: "Sabor",
        min: 1,
        max: 1,
        options: [
          ["Chocolate", 0],
          ["Morango", 0],
          ["Baunilha", 0],
          ["Ovomaltine", 400],
        ],
      },
    ],
  },
];

const sobremesas: ProductSpec[] = [
  {
    slug: "brownie-com-sorvete",
    name: "Brownie com Sorvete",
    description: "Brownie morno de chocolate meio amargo, sorvete de creme e calda de caramelo salgado.",
    priceCents: 2290,
    featured: true,
  },
  {
    slug: "copao-de-chocolate",
    name: "Copão de Chocolate",
    description: "Mousse de chocolate meio amargo, raspas de chocolate e frutas vermelhas.",
    priceCents: 2490,
  },
  {
    slug: "brownie-duplo",
    name: "Brownie Duplo",
    description: "Dois brownies com gotas de chocolate belga. Vai bem para dividir.",
    priceCents: 1890,
    available: false,
  },
];

export const seedProducts: Product[] = [
  ...brabos.map((spec, index) => buildProduct("cat_smash", spec, index)),
  ...combos.map((spec, index) => buildProduct("cat_combos", spec, index)),
  ...porcoes.map((spec, index) => buildProduct("cat_porcoes", spec, index)),
  ...bebidas.map((spec, index) => buildProduct("cat_bebidas", spec, index)),
  ...sobremesas.map((spec, index) => buildProduct("cat_sobremesas", spec, index)),
];

/* ------------------------------------------------------------------------ Loja */

export const seedStore: Store = {
  id: STORE_ID,
  slug: "bruto",
  name: "Bruto",
  tagline: "Burger & Chapa",
  headline: "Carne. Chapa. Fogo. Sem desculpas.",
  logoUrl: null,
  coverUrl: "/brand/cover.jpg",
  theme: {
    brand: "#ff4b2b",
    brandContrast: "#0e0e0e",
  },
  phone: "51998765432",
  address: "Rua Padre Chagas, 148 — Moinhos de Vento, Porto Alegre/RS",
  serviceModes: ["delivery", "pickup"],
  deliveryFeeCents: 799,
  minOrderCents: 2500,
  deliveryEtaMinutes: [35, 50],
  pickupEtaMinutes: [15, 25],
  paymentMethods: ["pix", "credit", "debit", "cash", "meal_voucher"],
  // Só à noite, com a janela virando a madrugada — o padrão real de
  // hamburgueria, e o caso que quebra qualquer cálculo ingênuo de horário.
  openingHours: [
    { weekday: 0, opensAt: "18:00", closesAt: "02:00" },
    { weekday: 1, opensAt: "18:00", closesAt: "02:00" },
    { weekday: 2, opensAt: "18:00", closesAt: "02:00" },
    { weekday: 3, opensAt: "18:00", closesAt: "02:00" },
    { weekday: 4, opensAt: "18:00", closesAt: "02:00" },
    { weekday: 5, opensAt: "18:00", closesAt: "03:00" },
    { weekday: 6, opensAt: "18:00", closesAt: "03:00" },
  ],
  acceptingOrders: true,
};

export const SEED_STORE_ID = STORE_ID;
