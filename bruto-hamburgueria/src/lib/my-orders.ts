"use client";

/**
 * Pedidos feitos sem conta.
 *
 * O cliente guarda localmente os ids dos próprios pedidos. É o que permite a
 * aba "Pedidos" funcionar sem obrigar cadastro — e o servidor continua sendo
 * a única fonte do conteúdo, consultado por id.
 */

function key(storeSlug: string): string {
  return `borapedir:orders:${storeSlug}`;
}

export function readMyOrderIds(storeSlug: string): string[] {
  try {
    const raw = window.localStorage.getItem(key(storeSlug));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function rememberOrder(storeSlug: string, orderId: string): void {
  try {
    const current = readMyOrderIds(storeSlug).filter((id) => id !== orderId);
    // Mais recentes primeiro, e sem crescer para sempre.
    const next = [orderId, ...current].slice(0, 30);
    window.localStorage.setItem(key(storeSlug), JSON.stringify(next));
  } catch {
    // Sem armazenamento a pessoa ainda consegue acompanhar pelo link direto.
  }
}
