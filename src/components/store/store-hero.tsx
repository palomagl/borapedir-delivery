import { ArrowRight, Bike, Clock, MapPin, Wallet } from "lucide-react";
import { HeroMedia } from "@/components/store/hero-media";
import { ServiceModeToggle } from "@/components/store/service-mode-toggle";
import { Wordmark } from "@/components/store/wordmark";
import { Button } from "@/components/ui/button";
import { isStoreOpen, nextOpeningLabel } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { Store } from "@/domain/types";
import { formatEta } from "@/lib/format";

/**
 * A entrada da loja.
 *
 * Não é um cabeçalho de sistema de delivery: é a marca ocupando a tela, com a
 * comida atrás e o mínimo de interface na frente. A informação operacional
 * vem logo abaixo, numa faixa seca — ela importa, mas não é o que dá vontade.
 */
export function StoreHero({ store }: { store: Store }) {
  const open = isStoreOpen(store);
  const nextOpening = open ? null : nextOpeningLabel(store);

  return (
    <section>
      {/* A margem negativa puxa o hero para debaixo da barra fixa, que fica
          transparente enquanto a página está no topo. */}
      <div className="relative -mt-14 flex min-h-[28rem] items-end overflow-hidden bg-paper-sunken sm:min-h-[34rem] lg:-mt-16 lg:min-h-[40rem]">
        <HeroMedia poster={store.coverUrl ?? "/brand/cover.jpg"} alt="" />

        {/* Duas camadas: uma que escurece a base para o texto, outra que
            devolve contraste ao topo sem apagar a foto. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-paper/25"
        />
        {/* Reforço à esquerda: é onde o texto cai, e a cena tem detalhe claro ali. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-paper/80 via-paper/25 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-paper/85 to-transparent" />

        <div className="relative mx-auto w-full max-w-[88rem] px-4 pb-10 pt-24 sm:pb-12 lg:px-8 lg:pb-16">
          {/*
            Com foto de fundo (celular, ou quem pediu menos movimento) a marca
            precisa aparecer grande. Com o vídeo, a própria cena já tem a
            marca na parede — aí quem fala é a frase de campanha, e o
            logotipo repetido só sujaria a composição.
          */}
          <div className="lg:motion-safe:hidden">
            {store.headline ? (
              <p className="eyebrow slash text-ink-soft">{store.headline}</p>
            ) : null}
            <Wordmark store={store} size="xl" className="mt-1" />
          </div>

          {store.headline ? (
            <p className="slash hidden max-w-[20ch] font-display text-[2.75rem] text-ink lg:motion-safe:block xl:text-[3.5rem]">
              {store.headline}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3 lg:mt-9">
            <Button asChild size="lg" className="group">
              <a href="#cardapio">
                {open ? "Pedir agora" : "Ver o cardápio"}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>

            <span
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[0.8125rem] font-semibold backdrop-blur-md ${
                open ? "bg-paper/60 text-ink" : "bg-paper/60 text-ink-muted"
              }`}
            >
              <span
                aria-hidden
                className={`size-2 rounded-full ${open ? "bg-success" : "bg-ink-faint"}`}
              />
              {open ? "Aberto agora" : "Fechado agora"}
            </span>
          </div>
        </div>
      </div>

      {/* Faixa operacional: as respostas que decidem o pedido, sem enfeite. */}
      <div className="border-b border-line bg-surface">
        <dl className="scroll-x mx-auto flex max-w-[88rem] items-center gap-x-7 gap-y-2 px-4 py-3.5 lg:px-8">
          <MetaItem icon={Clock} label="Tempo de entrega">
            {formatEta(store.deliveryEtaMinutes)}
          </MetaItem>
          <MetaItem icon={Bike} label="Taxa de entrega">
            {store.deliveryFeeCents === 0 ? "Entrega grátis" : formatCents(store.deliveryFeeCents)}
          </MetaItem>
          {store.minOrderCents > 0 ? (
            <MetaItem icon={Wallet} label="Pedido mínimo">
              mín. {formatCents(store.minOrderCents)}
            </MetaItem>
          ) : null}
          {store.address ? (
            <MetaItem icon={MapPin} label="Endereço" className="hidden xl:flex">
              {store.address}
            </MetaItem>
          ) : null}
        </dl>
      </div>

      {nextOpening ? (
        <p className="mx-auto max-w-[88rem] px-4 pt-4 lg:px-8">
          <span className="block rounded-md bg-warning-soft px-4 py-3 text-[0.8125rem] font-medium text-warning">
            A loja está fechada agora. {nextOpening}.
          </span>
        </p>
      ) : null}

      <div className="mx-auto max-w-[88rem] px-4 pt-4 lg:px-8 lg:pt-6">
        <div className="lg:max-w-lg">
          <ServiceModeToggle />
        </div>
      </div>
    </section>
  );
}

function MetaItem({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex shrink-0 items-center gap-2 ${className ?? ""}`}>
      <Icon className="size-4 shrink-0 text-ink-faint" aria-hidden />
      <dt className="sr-only">{label}</dt>
      <dd data-price className="whitespace-nowrap text-[0.8125rem] font-medium text-ink-soft">
        {children}
      </dd>
    </div>
  );
}
