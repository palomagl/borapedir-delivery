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

/** Converte "39,90" ou "39.90" digitado pelo lojista em 3990. */
export function parseToCents(input: string): number | null {
  const normalized = input.trim().replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function sumCents(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
