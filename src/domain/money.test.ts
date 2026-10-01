import { describe, expect, it } from "vitest";
import { formatCents, formatDelta, parseToCents, sumCents } from "./money";

/**
 * Intl.NumberFormat em pt-BR separa "R$" do número com espaço não separável
 * (U+00A0), não com espaço comum. Comparar sem normalizar dá aquele erro
 * perverso de "esperava X e recebeu X".
 */
const comEspacoComum = (value: string) => value.replace(/ /g, " ");

describe("dinheiro", () => {
  it("formata centavos em real", () => {
    expect(comEspacoComum(formatCents(3890))).toBe("R$ 38,90");
    expect(comEspacoComum(formatCents(0))).toBe("R$ 0,00");
    expect(comEspacoComum(formatCents(100000))).toBe("R$ 1.000,00");
  });

  it("mostra o sinal do acréscimo, e nada quando é zero", () => {
    expect(comEspacoComum(formatDelta(600))).toBe("+ R$ 6,00");
    expect(comEspacoComum(formatDelta(-250))).toBe("− R$ 2,50");
    expect(comEspacoComum(formatDelta(0))).toBe("");
  });

  describe("leitura do que o lojista digita", () => {
    it("aceita vírgula, ponto e o símbolo da moeda", () => {
      expect(parseToCents("38,90")).toBe(3890);
      expect(parseToCents("38.90")).toBe(3890);
      expect(parseToCents("R$ 38,90")).toBe(3890);
      expect(parseToCents(" 38,90 ")).toBe(3890);
    });

    it("entende o ponto de milhar", () => {
      expect(parseToCents("1.299,90")).toBe(129990);
    });

    it("devolve nulo para o que não é número", () => {
      expect(parseToCents("")).toBeNull();
      expect(parseToCents("abc")).toBeNull();
    });

    it("arredonda em vez de truncar", () => {
      // 38,905 vira 3891 e não 3890: truncar faria a loja perder um centavo
      // por item, todo dia.
      expect(parseToCents("38,905")).toBe(3891);
    });
  });

  it("soma sem erro de ponto flutuante", () => {
    // 0.1 + 0.2 em float dá 0.30000000000000004. Em centavos inteiros, não.
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([])).toBe(0);
  });
});
