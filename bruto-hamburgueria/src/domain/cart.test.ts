import { describe, expect, it } from "vitest";
import {
  addLine,
  buildLine,
  computeTotals,
  countItems,
  lineKey,
  lineTotalCents,
  lineUnitPriceCents,
  removeLine,
  setQuantity,
  validateSelections,
  type CartSelection,
} from "./cart";
import type { OptionGroup, Product, Store } from "./types";

function group(partial: Partial<OptionGroup> = {}): OptionGroup {
  return {
    id: "grp_add",
    productId: "prd_teste",
    name: "Manda mais",
    helperText: null,
    minSelect: 0,
    maxSelect: 3,
    sortOrder: 0,
    options: [],
    ...partial,
  };
}

function makeProduct(partial: Partial<Product> = {}): Product {
  return {
    id: "prd_teste",
    storeId: "str_teste",
    categoryId: "cat_teste",
    slug: "teste",
    name: "Bruto Bacon",
    description: null,
    imageUrl: null,
    priceCents: 3890,
    promoPriceCents: null,
    available: true,
    featured: false,
    sortOrder: 0,
    optionGroups: [],
    ...partial,
  };
}

const bacon: CartSelection = {
  groupId: "grp_add",
  groupName: "Manda mais",
  optionId: "opt_bacon",
  optionName: "Bacon crocante",
  priceDeltaCents: 600,
};

const cheddar: CartSelection = {
  groupId: "grp_add",
  groupName: "Manda mais",
  optionId: "opt_cheddar",
  optionName: "Cheddar extra",
  priceDeltaCents: 500,
};

describe("identidade da linha", () => {
  it("é a mesma para as mesmas opções em ordem diferente", () => {
    // Senão, escolher bacon e depois cheddar criaria uma linha diferente de
    // escolher cheddar e depois bacon.
    expect(lineKey("prd_teste", [bacon, cheddar], null)).toBe(
      lineKey("prd_teste", [cheddar, bacon], null),
    );
  });

  it("difere quando as opções diferem", () => {
    expect(lineKey("prd_teste", [bacon], null)).not.toBe(lineKey("prd_teste", [cheddar], null));
  });

  it("difere quando a observação difere", () => {
    expect(lineKey("prd_teste", [], "sem cebola")).not.toBe(lineKey("prd_teste", [], null));
  });

  it("ignora espaço em volta da observação", () => {
    expect(lineKey("prd_teste", [], "  sem cebola  ")).toBe(lineKey("prd_teste", [], "sem cebola"));
  });
});

describe("preço da linha", () => {
  it("soma os acréscimos ao preço base", () => {
    const line = buildLine(makeProduct(), [bacon, cheddar], null, 1);
    expect(lineUnitPriceCents(line)).toBe(3890 + 600 + 500);
  });

  it("multiplica pela quantidade", () => {
    const line = buildLine(makeProduct(), [bacon], null, 3);
    expect(lineTotalCents(line)).toBe((3890 + 600) * 3);
  });

  it("usa o preço promocional como base", () => {
    const line = buildLine(makeProduct({ promoPriceCents: 3390 }), [], null, 1);
    expect(lineUnitPriceCents(line)).toBe(3390);
  });
});

describe("montagem da sacola", () => {
  it("junta a quantidade quando o item é idêntico", () => {
    const product = makeProduct();
    let lines = addLine([], buildLine(product, [bacon], null, 1));
    lines = addLine(lines, buildLine(product, [bacon], null, 2));

    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("mantém linhas separadas quando a configuração difere", () => {
    const product = makeProduct();
    let lines = addLine([], buildLine(product, [bacon], null, 1));
    lines = addLine(lines, buildLine(product, [cheddar], null, 1));

    expect(lines).toHaveLength(2);
  });

  it("remove a linha quando a quantidade chega a zero", () => {
    const line = buildLine(makeProduct(), [], null, 1);
    expect(setQuantity([line], line.key, 0)).toHaveLength(0);
  });

  it("limita a quantidade máxima", () => {
    const line = buildLine(makeProduct(), [], null, 1);
    expect(setQuantity([line], line.key, 500)[0].quantity).toBe(99);
  });

  it("remove por chave", () => {
    const line = buildLine(makeProduct(), [], null, 1);
    expect(removeLine([line], line.key)).toHaveLength(0);
    expect(removeLine([line], "outra")).toHaveLength(1);
  });

  it("conta itens, não linhas", () => {
    const product = makeProduct();
    const lines = [buildLine(product, [bacon], null, 2), buildLine(product, [cheddar], null, 3)];
    expect(countItems(lines)).toBe(5);
  });
});

describe("totais", () => {
  const store: Store = {
    id: "str_teste",
    slug: "teste",
    name: "Teste",
    tagline: null,
    headline: null,
    logoUrl: null,
    coverUrl: null,
    theme: { brand: "#ff4b2b", brandContrast: "#0e0e0e" },
    phone: null,
    address: null,
    serviceModes: ["delivery", "pickup"],
    deliveryFeeCents: 799,
    minOrderCents: 2500,
    deliveryEtaMinutes: [35, 50],
    pickupEtaMinutes: [15, 25],
    paymentMethods: ["pix"],
    openingHours: [],
    acceptingOrders: true,
  };

  it("cobra a taxa na entrega", () => {
    const lines = [buildLine(makeProduct(), [], null, 1)];
    const totals = computeTotals(lines, store, "delivery");

    expect(totals.subtotalCents).toBe(3890);
    expect(totals.deliveryFeeCents).toBe(799);
    expect(totals.totalCents).toBe(4689);
  });

  it("não cobra taxa na retirada", () => {
    const lines = [buildLine(makeProduct(), [], null, 1)];
    const totals = computeTotals(lines, store, "pickup");

    expect(totals.deliveryFeeCents).toBe(0);
    expect(totals.totalCents).toBe(3890);
  });

  it("calcula quanto falta para o pedido mínimo", () => {
    const lines = [buildLine(makeProduct({ priceCents: 1000 }), [], null, 1)];
    expect(computeTotals(lines, store, "delivery").missingForMinimumCents).toBe(1500);
  });

  it("não exige mínimo na retirada", () => {
    const lines = [buildLine(makeProduct({ priceCents: 1000 }), [], null, 1)];
    expect(computeTotals(lines, store, "pickup").missingForMinimumCents).toBe(0);
  });

  it("nunca deixa o total negativo", () => {
    const lines = [buildLine(makeProduct({ priceCents: 1000 }), [], null, 1)];
    expect(computeTotals(lines, store, "pickup", 99999).totalCents).toBe(0);
  });
});

describe("validação das escolhas", () => {
  const tamanho = group({
    id: "grp_tam",
    name: "Tamanho",
    minSelect: 1,
    maxSelect: 1,
    options: [],
  });

  const simples: CartSelection = {
    groupId: "grp_tam",
    groupName: "Tamanho",
    optionId: "opt_simples",
    optionName: "Simples",
    priceDeltaCents: 0,
  };

  it("exige o grupo obrigatório", () => {
    const errors = validateSelections(makeProduct({ optionGroups: [tamanho] }), []);
    expect(errors).toHaveLength(1);
    expect(errors[0].groupId).toBe("grp_tam");
  });

  it("aceita quando o obrigatório foi escolhido", () => {
    expect(validateSelections(makeProduct({ optionGroups: [tamanho] }), [simples])).toHaveLength(0);
  });

  it("recusa mais escolhas do que o grupo permite", () => {
    const adicionais = group({ maxSelect: 1 });
    const errors = validateSelections(
      makeProduct({ optionGroups: [adicionais] }),
      [bacon, cheddar],
    );
    expect(errors).toHaveLength(1);
  });

  it("não exige nada de produto sem opções", () => {
    expect(validateSelections(makeProduct(), [])).toHaveLength(0);
  });
});
