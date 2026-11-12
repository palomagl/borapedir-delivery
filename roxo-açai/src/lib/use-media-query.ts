"use client";

import { useSyncExternalStore } from "react";

/**
 * Media query sem descompasso de hidratação: no servidor o snapshot é sempre
 * false, e o componente que depende disso só renderiza conteúdo quando aberto.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Ponto de virada entre a composição mobile e a de mesa. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
