import type { CartLine } from "@/domain/cart";
import type { ServiceMode } from "@/domain/types";

/**
 * O carrinho vive no localStorage, que é um sistema externo ao React.
 *
 * Tratá-lo como tal — e não como estado lido dentro de um efeito — resolve
 * três coisas de uma vez: o HTML do servidor nunca diverge do cliente, duas
 * abas da mesma loja ficam em sincronia, e não há render em cascata na
 * montagem.
 */

export interface CartState {
  lines: CartLine[];
  serviceMode: ServiceMode;
}

type Listener = () => void;

/** Snapshot do servidor: estável e vazio, sempre a mesma referência. */
const EMPTY: CartState = Object.freeze({ lines: [], serviceMode: "delivery" });

export class CartStore {
  private state: CartState;
  private listeners = new Set<Listener>();
  private readonly key: string;

  constructor(
    private readonly storeSlug: string,
    private readonly defaultMode: ServiceMode,
    private readonly allowedModes: readonly ServiceMode[],
  ) {
    this.key = `borapedir:cart:${storeSlug}`;
    this.state = this.read();
  }

  private read(): CartState {
    if (typeof window === "undefined") return EMPTY;

    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return { lines: [], serviceMode: this.defaultMode };

      const parsed = JSON.parse(raw) as Partial<CartState>;
      const lines = Array.isArray(parsed.lines) ? parsed.lines : [];
      const mode =
        parsed.serviceMode && this.allowedModes.includes(parsed.serviceMode)
          ? parsed.serviceMode
          : this.defaultMode;

      return { lines, serviceMode: mode };
    } catch {
      // Armazenamento bloqueado ou conteúdo corrompido: começa vazio.
      return { lines: [], serviceMode: this.defaultMode };
    }
  }

  private write(state: CartState) {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(state));
    } catch {
      // Sem armazenamento o carrinho ainda funciona nesta sessão.
    }
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);

    // Outra aba da mesma loja mexeu na sacola: adota o que ela gravou.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== this.key) return;
      this.state = this.read();
      this.emit();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      this.listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  getSnapshot = (): CartState => this.state;

  getServerSnapshot = (): CartState => EMPTY;

  update(next: Partial<CartState>) {
    this.state = { ...this.state, ...next };
    this.write(this.state);
    this.emit();
  }

  get slug(): string {
    return this.storeSlug;
  }
}

/**
 * Uma instância por loja, estável entre renders. Sem isto, cada render criaria
 * um store novo e `useSyncExternalStore` entraria em laço.
 */
const stores = new Map<string, CartStore>();

export function getCartStore(
  storeSlug: string,
  defaultMode: ServiceMode,
  allowedModes: readonly ServiceMode[],
): CartStore {
  let store = stores.get(storeSlug);
  if (!store) {
    store = new CartStore(storeSlug, defaultMode, allowedModes);
    stores.set(storeSlug, store);
  }
  return store;
}
