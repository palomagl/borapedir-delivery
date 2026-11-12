import { Clock, CreditCard, MapPin, Phone, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wordmark } from "@/components/store/wordmark";
import { Button } from "@/components/ui/button";
import { isStoreOpen, weekdayLabel } from "@/domain/catalog";
import type { OpeningHour, Store } from "@/domain/types";
import { formatPhone, PAYMENT_LABELS } from "@/lib/format";
import { loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "A casa" };

export default async function ProfilePage({ params }: { params: Promise<{ store: string }> }) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const open = isStoreOpen(store);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 lg:px-8 lg:pt-12">
      <Wordmark store={store} size="lg" />

      <p
        className={`mt-5 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[0.8125rem] font-bold ${
          open ? "bg-success-soft text-success" : "bg-surface-raised text-ink-soft"
        }`}
      >
        <span aria-hidden className={`size-2 rounded-full ${open ? "bg-success" : "bg-ink-faint"}`} />
        {open ? "Aberto agora" : "Fechado agora"}
      </p>

      <Button asChild block size="lg" className="mt-6">
        <Link href={`/${store.slug}/pedidos`}>
          <ReceiptText />
          Ver meus pedidos
        </Link>
      </Button>

      <Section icon={Clock} title="Horários">
        <WeekSchedule hours={store.openingHours} />
      </Section>

      {store.address ? (
        <Section icon={MapPin} title="Onde ficamos">
          <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{store.address}</p>
        </Section>
      ) : null}

      {store.phone ? (
        <Section icon={Phone} title="Falar com a casa">
          <a
            href={`tel:+55${store.phone}`}
            className="text-[0.9375rem] font-semibold text-[var(--store-brand)] hover:underline"
          >
            {formatPhone(store.phone)}
          </a>
        </Section>
      ) : null}

      <Section icon={CreditCard} title="Formas de pagamento">
        <ul className="flex flex-wrap gap-2">
          {store.paymentMethods.map((method) => (
            <li
              key={method}
              className="rounded-sm bg-surface-raised px-2.5 py-1.5 text-[0.8125rem] font-medium text-ink-soft"
            >
              {PAYMENT_LABELS[method]}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.8125rem] text-ink-muted">
          O pagamento é feito na entrega ou na retirada.
        </p>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-bold text-ink">
        <Icon className="size-4 text-ink-faint" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Horários agrupados por dia — a loja pode ter almoço e noite no mesmo dia. */
function WeekSchedule({ hours }: { hours: Store["openingHours"] }) {
  const today = new Date().getDay();

  const byWeekday = new Map<number, OpeningHour[]>();
  for (const hour of hours) {
    const list = byWeekday.get(hour.weekday) ?? [];
    list.push(hour);
    byWeekday.set(hour.weekday, list);
  }

  // Começa na segunda: é como as pessoas leem uma semana.
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <dl className="divide-y divide-line rounded-lg bg-surface px-4 hairline">
      {order.map((weekday) => {
        const windows = (byWeekday.get(weekday) ?? []).sort((a, b) =>
          a.opensAt.localeCompare(b.opensAt),
        );

        return (
          <div key={weekday} className="flex items-baseline justify-between gap-4 py-3">
            <dt
              className={`text-[0.875rem] ${
                weekday === today ? "font-bold text-ink" : "text-ink-soft"
              }`}
            >
              {weekdayLabel(weekday)}
              {weekday === today ? <span className="ml-2 text-[0.75rem] text-[var(--store-brand)]">hoje</span> : null}
            </dt>
            <dd data-price className="text-right text-[0.875rem] text-ink-muted">
              {windows.length === 0
                ? "Fechado"
                : windows.map((window) => `${window.opensAt}–${window.closesAt}`).join(" · ")}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
