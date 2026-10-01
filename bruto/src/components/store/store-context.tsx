"use client";

import * as React from "react";
import {
  addLine,
  buildLine,
  computeTotals,
  countItems,
  removeLine,
  setQuantity,
  type CartLine,
  type CartSelection,
  type CartTotals,
} from "@/domain/cart";
import { isStoreOpen } from "@/domain/catalog";
import type { Product, ServiceMode, Store } from "@/domain/types";
import { getCartStore } from "@/lib/cart-store";

/**
 * Estado que atravessa a loja inteira: a loja em si, o catálogo, o carrinho e
 * o modo de entrega escolhido.
 */

interface StoreContextValue {
  store: Store;
  /** Catálogo da loja, já no cliente: alimenta a busca e a edição de itens. */
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  lines: CartLine[];
  itemCount: number;
  totals: CartTotals;
  serviceMode: ServiceMode;
  /** Se a loja aceita pedidos agora. Reavaliado periodicamente no cliente. */
  isOpen: boolean;
  /** Falso no HTML do servidor e no primeiro render; verdadeiro depois. */
  hydrated: boolean;

  setServiceMode: (mode: ServiceMode) => void;
  addItem: (
    product: Product,
    selections: readonly CartSelection[],
    note: string | null,
    quantity: number,
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

/** Marca o fim da hidratação sem precisar de estado nem de efeito. */
const hydrationStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};

export function StoreProvider({
  store,
  products,
  initiallyOpen,
  children,
}: {
  store: Store;
  products: Product[];
  /** Calculado no servidor, para o HTML já sair correto. */
  initiallyOpen: boolean;
  children: React.ReactNode;
}) {
  const cart = React.useMemo(
    () => getCartStore(store.slug, store.serviceModes[0] ?? "delivery", store.serviceModes),
    [store.slug, store.serviceModes],
  );

  const { lines, serviceMode } = React.useSyncExternalStore(
    cart.subscribe,
    cart.getSnapshot,
    cart.getServerSnapshot,
  );

  const hydrated = React.useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot,
  );

  // A loja abre e fecha enquanto a aba fica aberta: quem carregou a página às
  // 14h59 não pode continuar vendo "aberto" às 15h30.
  const [isOpen, setIsOpen] = React.useState(initiallyOpen);
  React.useEffect(() => {
    const timer = window.setInterval(() => setIsOpen(isStoreOpen(store)), 30_000);
    return () => window.clearInterval(timer);
  }, [store]);

  const setServiceMode = React.useCallback(
    (mode: ServiceMode) => cart.update({ serviceMode: mode }),
    [cart],
  );

  const addItem = React.useCallback<StoreContextValue["addItem"]>(
    (product, selections, note, quantity) => {
      cart.update({
        lines: addLine(cart.getSnapshot().lines, buildLine(product, selections, note, quantity)),
      });
    },
    [cart],
  );

  const updateQuantity = React.useCallback(
    (key: string, quantity: number) => {
      cart.update({ lines: setQuantity(cart.getSnapshot().lines, key, quantity) });
    },
    [cart],
  );

  const removeItem = React.useCallback(
    (key: string) => {
      cart.update({ lines: removeLine(cart.getSnapshot().lines, key) });
    },
    [cart],
  );

  const clearCart = React.useCallback(() => cart.update({ lines: [] }), [cart]);

  const productsById = React.useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const getProduct = React.useCallback((id: string) => productsById.get(id), [productsById]);

  const value = React.useMemo<StoreContextValue>(
    () => ({
      store,
      products,
      getProduct,
      lines,
      itemCount: countItems(lines),
      totals: computeTotals(lines, store, serviceMode),
      serviceMode,
      isOpen,
      hydrated,
      setServiceMode,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      store,
      products,
      getProduct,
      lines,
      serviceMode,
      isOpen,
      hydrated,
      setServiceMode,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = React.useContext(StoreContext);
  if (!context) throw new Error("useStore precisa estar dentro de StoreProvider");
  return context;
}
