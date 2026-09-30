import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[5rem] leading-none text-ink-faint">404</p>
      <h1 className="mt-4 font-display text-[1.75rem] leading-none text-ink">
        Não encontramos esta página
      </h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
        O link pode ter mudado ou a loja pode não estar mais disponível.
      </p>
      <Button asChild variant="outline" className="mt-7">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
