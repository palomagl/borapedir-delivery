"use client";

import * as React from "react";

/** Verdadeiro depois que a página passou de `threshold` pixels do topo. */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
}
