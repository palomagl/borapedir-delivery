import { effectivePriceCents, isSingleChoice } from "./catalog";
import { sumCents } from "./money";
import type { ID, Product, Store } from "./types";

/** Opção escolhida, já com o rótulo, para o carrinho não precisar do catálogo. */
export interface CartSelection {
  groupId: ID;
  groupName: string;
  optionId: ID;
  optionName: string;
  priceDeltaCents: number;
}

export interface CartLine {
  /** Identidade da linha: mesmo produto + mesma configuração = mesma linha. */
  key: string;
  productId: ID;
  productSlug: string;
  productName: string;
  productImageUrl: string | null;
  unitBasePriceCents: number;
  selections: CartSelection[];
  note: string | null;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  /** Quanto falta para atingir o pedido mínimo. 0 quando já atingiu. */
  missingForMinimumCents: number;
}

/**
 * Duas linhas só se fundem se produto, opções e observação forem idênticos.
 * A chave é legível de propósito — facilita depurar carrinho em produção.
 */
export function lineKey(
  productId: ID,
  selections: readonly CartSelection[],
  note: string | null,
): string {
  const options = selections
    .map((selection) => selection.optionId)
    .sort()
    .join(",");
  const trimmedNote = note?.trim() ?? "";
  return `${productId}|${options}|${trimmedNote}`;
}

export function buildLine(
  product: Product,
  selections: readonly CartSelection[],
  note: string | null,
  quantity: number,
): CartLine {
  const cleanNote = note?.trim() ? note.trim() : null;
  return {
    key: lineKey(product.id, selections, cleanNote),
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    productImageUrl: product.imageUrl,
    unitBasePriceCents: effectivePriceCents(product),
    selections: [...selections],
    note: cleanNote,
    quantity,
  };
}

export function lineUnitPriceCents(line: CartLine): number {
  return line.unitBasePriceCents + sumCents(line.selections.map((s) => s.priceDeltaCents));
}

export function lineTotalCents(line: CartLine): number {
  return lineUnitPriceCents(line) * line.quantity;
}

export function addLine(lines: readonly CartLine[], incoming: CartLine): CartLine[] {
  const existing = lines.findIndex((line) => line.key === incoming.key);
  if (existing === -1) return [...lines, incoming];

  return lines.map((line, index) =>
    index === existing ? { ...line, quantity: line.quantity + incoming.quantity } : line,
  );
}

const MAX_QUANTITY = 99;

export function setQuantity(lines: readonly CartLine[], key: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((line) => line.key !== key);
  const clamped = Math.min(quantity, MAX_QUANTITY);
  return lines.map((line) => (line.key === key ? { ...line, quantity: clamped } : line));
}

export function removeLine(lines: readonly CartLine[], key: string): CartLine[] {
  return lines.filter((line) => line.key !== key);
}

export function countItems(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function computeTotals(
  lines: readonly CartLine[],
  store: Store,
  serviceMode: "delivery" | "pickup",
  discountCents = 0,
): CartTotals {
  const subtotalCents = sumCents(lines.map(lineTotalCents));
  const deliveryFeeCents = serviceMode === "delivery" ? store.deliveryFeeCents : 0;
  const missing =
    serviceMode === "delivery" ? Math.max(0, store.minOrderCents - subtotalCents) : 0;

  return {
    itemCount: countItems(lines),
    subtotalCents,
    deliveryFeeCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents + deliveryFeeCents - discountCents),
    missingForMinimumCents: missing,
  };
}

/* ------------------------------------------------------------- Validação */

export interface SelectionError {
  groupId: ID;
  message: string;
}

/**
 * Checa cardinalidade de cada grupo. Roda no cliente para habilitar o botão
 * e de novo no servidor antes de gravar o pedido.
 */
export function validateSelections(
  product: Product,
  selections: readonly CartSelection[],
): SelectionError[] {
  const errors: SelectionError[] = [];

  for (const group of product.optionGroups) {
    const chosen = selections.filter((selection) => selection.groupId === group.id);

    if (chosen.length < group.minSelect) {
      errors.push({
        groupId: group.id,
        message: isSingleChoice(group)
          ? "Escolha uma opção"
          : `Escolha pelo menos ${group.minSelect}`,
      });
      continue;
    }
    if (chosen.length > group.maxSelect) {
      errors.push({
        groupId: group.id,
        message: `Escolha no máximo ${group.maxSelect}`,
      });
    }
  }

  return errors;
}
