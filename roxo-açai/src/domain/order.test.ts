import { describe, expect, it } from "vitest";
import { canTransition, isFinal, nextStatuses, primaryAction, trackingSteps } from "./order";
import { ORDER_STATUSES } from "./types";

describe("máquina de estados do pedido", () => {
  it("segue o caminho normal da operação", () => {
    expect(canTransition("pending", "accepted")).toBe(true);
    expect(canTransition("accepted", "preparing")).toBe(true);
    expect(canTransition("preparing", "ready")).toBe(true);
    expect(canTransition("ready", "out_for_delivery")).toBe(true);
    expect(canTransition("out_for_delivery", "delivered")).toBe(true);
  });

  it("recusa pular etapas", () => {
    // Um pedido não vai de "novo" direto para "entregue": seria perder o
    // rastro do que a cozinha fez.
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("pending", "preparing")).toBe(false);
  });

  it("recusa voltar atrás", () => {
    expect(canTransition("preparing", "pending")).toBe(false);
    expect(canTransition("delivered", "preparing")).toBe(false);
  });

  it("não deixa sair de um estado final", () => {
    for (const status of ORDER_STATUSES) {
      expect(canTransition("delivered", status)).toBe(false);
      expect(canTransition("canceled", status)).toBe(false);
    }
  });

  it("permite cancelar enquanto o pedido não saiu", () => {
    expect(canTransition("pending", "canceled")).toBe(true);
    expect(canTransition("accepted", "canceled")).toBe(true);
    expect(canTransition("preparing", "canceled")).toBe(true);
    expect(canTransition("ready", "canceled")).toBe(true);
  });

  it("não deixa cancelar depois de sair para entrega", () => {
    expect(canTransition("out_for_delivery", "canceled")).toBe(false);
  });

  it("reconhece os estados finais", () => {
    expect(isFinal("delivered")).toBe(true);
    expect(isFinal("canceled")).toBe(true);
    expect(isFinal("preparing")).toBe(false);
  });
});

describe("próximos estados por modalidade", () => {
  it("oferece despachar na entrega", () => {
    expect(nextStatuses("ready", "delivery")).toContain("out_for_delivery");
  });

  it("não oferece despachar na retirada", () => {
    // Quem retira no balcão não tem entregador.
    expect(nextStatuses("ready", "pickup")).not.toContain("out_for_delivery");
    expect(nextStatuses("ready", "pickup")).toContain("delivered");
  });
});

describe("ação sugerida no painel", () => {
  it("sugere aceitar um pedido novo", () => {
    expect(primaryAction("pending", "delivery")).toEqual({
      status: "accepted",
      label: "Aceitar",
    });
  });

  it("nunca sugere cancelar como ação principal", () => {
    for (const status of ORDER_STATUSES) {
      expect(primaryAction(status, "delivery")?.status).not.toBe("canceled");
    }
  });

  it("não sugere nada num pedido encerrado", () => {
    expect(primaryAction("delivered", "delivery")).toBeNull();
    expect(primaryAction("canceled", "delivery")).toBeNull();
  });
});

describe("etapas mostradas ao cliente", () => {
  it("mostra o trajeto do entregador na entrega", () => {
    expect(trackingSteps("delivery")).toContain("out_for_delivery");
  });

  it("mostra 'pronto' na retirada, e não o trajeto", () => {
    const steps = trackingSteps("pickup");
    expect(steps).toContain("ready");
    expect(steps).not.toContain("out_for_delivery");
  });

  it("não mostra cancelado como etapa: é desvio, não caminho", () => {
    expect(trackingSteps("delivery")).not.toContain("canceled");
    expect(trackingSteps("pickup")).not.toContain("canceled");
  });
});
