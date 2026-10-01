/** Dinheiro em centavos. Nenhum float entra ou sai daqui. */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const BRL_COMPACT = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number): string {
  return BRL.format(cents / 100);
}

/** "39,90" — sem o símbolo, para quando o R$ já aparece ao lado. */
export function formatCentsBare(cents: number): string {
  return BRL_COMPACT.format(cents / 100);
}

/** "+ R$ 5,00" / "− R$ 2,00" — usado em adicionais. */
export function formatDelta(cents: number): string {
  if (cents === 0) return "";
  const sign = cents > 0 ? "+" : "−";
  return `${sign} ${BRL.format(Math.abs(cents) / 100)}`;
}

/**
 * Converte o que o lojista digita em centavos.
 *
 * O ponto é ambíguo em português: em "1.299,90" é milhar, em "38.90" é
 * decimal. A regra: havendo vírgula, ela é o decimal e o ponto é milhar.
 * Sem vírgula, um ponto seguido de exatamente três dígitos é milhar
 * ("1.299"); qualquer outro ponto é decimal ("38.90").
 */
export function parseToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[^\d,.-]/g, "");
  if (cleaned === "") return null;

  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/\.\d{3}(?:\D|$)/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function sumCents(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
