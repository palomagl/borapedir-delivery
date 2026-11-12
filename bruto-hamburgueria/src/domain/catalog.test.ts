import { describe, expect, it } from "vitest";
import { effectivePriceCents, hasPromo, isWithinHours, nextOpeningLabel } from "./catalog";
import type { OpeningHour, Product, Store } from "./types";

function makeProduct(partial: Partial<Product> = {}): Product {
  return {
    id: "prd_teste",
    storeId: "str_teste",
    categoryId: "cat_teste",
    slug: "teste",
    name: "Teste",
    description: null,
    imageUrl: null,
    priceCents: 4190,
    promoPriceCents: null,
    available: true,
    featured: false,
    sortOrder: 0,
    optionGroups: [],
    ...partial,
  };
}

describe("preço efetivo", () => {
  it("usa o preço cheio quando não há promoção", () => {
    const product = makeProduct();
    expect(effectivePriceCents(product)).toBe(4190);
    expect(hasPromo(product)).toBe(false);
  });

  it("usa a promoção quando ela é menor", () => {
    const product = makeProduct({ promoPriceCents: 3690 });
    expect(effectivePriceCents(product)).toBe(3690);
    expect(hasPromo(product)).toBe(true);
  });

  it("ignora promoção maior ou igual ao preço cheio", () => {
    // Promoção que não baixa nada não é promoção, e não pode aparecer como
    // tal na vitrine.
    expect(effectivePriceCents(makeProduct({ promoPriceCents: 4190 }))).toBe(4190);
    expect(hasPromo(makeProduct({ promoPriceCents: 4500 }))).toBe(false);
  });
});

/* ------------------------------------------------- Horário de funcionamento */

/** Quarta-feira, 1 de outubro de 2025. */
function quarta(hora: number, minuto = 0): Date {
  return new Date(2025, 9, 1, hora, minuto);
}

describe("janela de funcionamento", () => {
  const noite: OpeningHour[] = [{ weekday: 3, opensAt: "18:00", closesAt: "23:00" }];

  it("abre no horário e fecha fora dele", () => {
    expect(isWithinHours(noite, quarta(17, 59))).toBe(false);
    expect(isWithinHours(noite, quarta(18, 0))).toBe(true);
    expect(isWithinHours(noite, quarta(22, 59))).toBe(true);
  });

  it("fecha no minuto do fechamento, não depois", () => {
    expect(isWithinHours(noite, quarta(23, 0))).toBe(false);
  });

  describe("janela que atravessa a meia-noite", () => {
    // O caso que quebra qualquer comparação ingênua de horas: às 0h30 de
    // quinta, quem está aberta é a janela de quarta-feira.
    const madrugada: OpeningHour[] = [{ weekday: 3, opensAt: "18:00", closesAt: "02:00" }];

    it("continua aberta depois da meia-noite", () => {
      const quintaMadrugada = new Date(2025, 9, 2, 0, 30);
      expect(isWithinHours(madrugada, quintaMadrugada)).toBe(true);
    });

    it("fecha quando a janela termina", () => {
      const quintaDepois = new Date(2025, 9, 2, 2, 1);
      expect(isWithinHours(madrugada, quintaDepois)).toBe(false);
    });

    it("não abre antes da hora no próprio dia", () => {
      expect(isWithinHours(madrugada, quarta(10, 0))).toBe(false);
    });
  });

  it("aceita mais de uma janela no mesmo dia", () => {
    const almocoENoite: OpeningHour[] = [
      { weekday: 3, opensAt: "11:30", closesAt: "15:00" },
      { weekday: 3, opensAt: "18:00", closesAt: "23:00" },
    ];
    expect(isWithinHours(almocoENoite, quarta(12, 0))).toBe(true);
    expect(isWithinHours(almocoENoite, quarta(16, 0))).toBe(false);
    expect(isWithinHours(almocoENoite, quarta(19, 0))).toBe(true);
  });

  it("fica fechada sem nenhuma janela cadastrada", () => {
    expect(isWithinHours([], quarta(19, 0))).toBe(false);
  });
});

describe("próxima abertura", () => {
  function makeStore(hours: OpeningHour[]): Store {
    return {
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
      serviceModes: ["delivery"],
      deliveryFeeCents: 0,
      minOrderCents: 0,
      deliveryEtaMinutes: [30, 45],
      pickupEtaMinutes: [10, 20],
      paymentMethods: ["pix"],
      openingHours: hours,
      acceptingOrders: true,
    };
  }

  it("avisa que abre hoje quando ainda vai abrir", () => {
    const store = makeStore([{ weekday: 3, opensAt: "18:00", closesAt: "23:00" }]);
    expect(nextOpeningLabel(store, quarta(10, 0))).toBe("Abre hoje às 18:00");
  });

  it("aponta o próximo dia quando a janela de hoje já passou", () => {
    const store = makeStore([
      { weekday: 3, opensAt: "18:00", closesAt: "23:00" },
      { weekday: 4, opensAt: "18:00", closesAt: "23:00" },
    ]);
    expect(nextOpeningLabel(store, quarta(23, 30))).toBe("Abre amanhã às 18:00");
  });

  it("não promete nada sem horário cadastrado", () => {
    expect(nextOpeningLabel(makeStore([]), quarta(10, 0))).toBeNull();
  });
});
