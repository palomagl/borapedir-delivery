import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-ink-muted">Erro 404</p>

      <p className="slash mt-4 font-display text-[4rem] leading-none text-ink sm:text-[6rem]">
        Essa não saiu<br />da chapa
      </p>

      <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
        A página que você procurou não existe, mudou de endereço ou saiu do cardápio.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft />
            Voltar ao cardápio
          </Link>
        </Button>
      </div>
    </main>
  );
}
