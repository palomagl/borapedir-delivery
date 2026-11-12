import "server-only";

/**
 * Limite de taxa por janela deslizante, em memória.
 *
 * Serve ao caso concreto deste projeto: impedir que alguém dispare mil
 * pedidos ou mil tentativas de senha em sequência. Não substitui um limite
 * de infraestrutura — em várias instâncias, cada uma conta a sua — mas já
 * corta o roteiro automatizado que tenta forçar a entrada.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Impede o mapa de crescer para sempre em processo de vida longa. */
function sweep(now: number) {
  if (windows.size < 500) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos até a janela liberar. Zero quando ainda há saldo. */
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.count += 1;

  if (current.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Só para os testes: zera o estado entre casos. */
export function resetRateLimits(): void {
  windows.clear();
}
