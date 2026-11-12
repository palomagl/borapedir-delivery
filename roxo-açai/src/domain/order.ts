import type { OrderStatus, ServiceMode } from "./types";

interface StatusMeta {
  label: string;
  /** O que o cliente lê na tela de acompanhamento. */
  customerLabel: string;
  tone: "neutral" | "info" | "warning" | "success" | "danger";
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: { label: "Novo", customerLabel: "Aguardando confirmação", tone: "warning" },
  accepted: { label: "Aceito", customerLabel: "Pedido confirmado", tone: "info" },
  preparing: { label: "Em preparo", customerLabel: "Preparando seu pedido", tone: "info" },
  ready: { label: "Pronto", customerLabel: "Pronto para retirada", tone: "success" },
  out_for_delivery: { label: "Saiu para entrega", customerLabel: "A caminho", tone: "info" },
  delivered: { label: "Entregue", customerLabel: "Entregue", tone: "success" },
  canceled: { label: "Cancelado", customerLabel: "Pedido cancelado", tone: "danger" },
};

/**
 * Máquina de estados. Retirada pula "saiu para entrega"; entrega pula "pronto"
 * como estado final. Cancelar é possível até o pedido sair.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "canceled"],
  accepted: ["preparing", "canceled"],
  preparing: ["ready", "canceled"],
  ready: ["out_for_delivery", "delivered", "canceled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  canceled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus, mode: ServiceMode): OrderStatus[] {
  return TRANSITIONS[from].filter((status) => {
    if (mode === "pickup" && status === "out_for_delivery") return false;
    return true;
  });
}

/** Ação principal sugerida na lista de pedidos do admin. */
export function primaryAction(
  status: OrderStatus,
  mode: ServiceMode,
): { status: OrderStatus; label: string } | null {
  const next = nextStatuses(status, mode).filter((candidate) => candidate !== "canceled");
  if (next.length === 0) return null;
  const target = next[0];
  const labels: Record<OrderStatus, string> = {
    pending: "Reabrir",
    accepted: "Aceitar",
    preparing: "Iniciar preparo",
    ready: "Marcar pronto",
    out_for_delivery: "Despachar",
    delivered: "Concluir",
    canceled: "Cancelar",
  };
  return { status: target, label: labels[target] };
}

/** Etapas mostradas ao cliente no acompanhamento. */
export function trackingSteps(mode: ServiceMode): OrderStatus[] {
  return mode === "delivery"
    ? ["pending", "accepted", "preparing", "out_for_delivery", "delivered"]
    : ["pending", "accepted", "preparing", "ready", "delivered"];
}

export function isFinal(status: OrderStatus): boolean {
  return status === "delivered" || status === "canceled";
}
