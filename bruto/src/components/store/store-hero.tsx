import { ArrowRight } from "lucide-react";
import { HeroMedia } from "@/components/store/hero-media";
import { Button } from "@/components/ui/button";
import { nextOpeningLabel, isStoreOpen } from "@/domain/catalog";
import type { Store } from "@/domain/types";

/** Banner de campanha com o vídeo original e acesso direto ao cardápio. */
export function StoreHero({ store }: { store: Store }) {
  const open = isStoreOpen(store);
  const nextOpening = open ? null : nextOpeningLabel(store);

  return (
    <section>
      <div className="relative flex min-h-[15rem] items-center overflow-hidden bg-paper-sunken sm:min-h-[24rem] lg:min-h-[25rem]">
        <HeroMedia poster={store.coverUrl ?? "/brand/cover.jpg"} alt="" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-black/5" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative mx-auto w-full max-w-[76rem] px-5 py-7 lg:px-8 lg:py-14">
          <h1 className="font-display max-w-[12ch] text-[2rem] sm:text-5xl lg:text-[3.75rem]">
            Peça seu<br /><span className="text-[var(--store-brand)]">Bruto agora.</span>
          </h1>
          <p className="mt-4 max-w-[21rem] text-sm leading-snug text-white sm:text-lg lg:text-xl">
            Hambúrgueres artesanais, combos<br className="hidden sm:block" /> e acompanhamentos.
          </p>
          <Button asChild size="lg" className="group mt-6 h-11 px-6 text-sm lg:h-14 lg:px-9 lg:text-lg">
            <a href="#cardapio">Ver cardápio<ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" /></a>
          </Button>
        </div>
      </div>

      {nextOpening ? (
        <p className="mx-auto max-w-[76rem] px-4 pt-4 lg:px-8">
          <span className="block rounded-md bg-warning-soft px-4 py-3 text-[0.8125rem] font-medium text-warning">
            A loja está fechada agora. {nextOpening}.
          </span>
        </p>
      ) : null}

    </section>
  );
}
