"use client";

import { RotateCcw } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Último anteparo antes da tela branca.
 *
 * O cliente não precisa saber o que estourou — precisa de uma saída. O
 * detalhe técnico vai para o console, onde serve a quem conserta.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Falha não tratada:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-ink-muted">Algo saiu errado</p>

      <p className="slash mt-4 font-display text-[3rem] leading-none text-ink sm:text-[4rem]">
        Deu ruim na cozinha
      </p>

      <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
        Não conseguimos carregar esta página agora. Tente de novo — se insistir, volte daqui
        a pouco.
      </p>

      <Button size="lg" className="mt-8" onClick={reset}>
        <RotateCcw />
        Tentar de novo
      </Button>

      {error.digest ? (
        <p className="mt-6 font-mono text-[0.75rem] text-ink-faint">Código: {error.digest}</p>
      ) : null}
    </main>
  );
}
