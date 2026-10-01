import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { isStoreOpen, weekdayLabel } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { OpeningHour } from "@/domain/types";
import { formatEta, formatPhone, PAYMENT_LABELS, SERVICE_MODE_LABELS } from "@/lib/format";
import { loadStore } from "@/server/store-data";

export const metadata: Metadata = { title: "Configurações" };

export default async function AdminSettings({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;

  const store = await loadStore(slug);
  if (!store) notFound();

  const open = isStoreOpen(store);

  const byWeekday = new Map<number, OpeningHour[]>();
  for (const hour of store.openingHours) {
    const list = byWeekday.get(hour.weekday) ?? [];
    list.push(hour);
    byWeekday.set(hour.weekday, list);
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Configurações" description="Como a loja aparece e opera." />

      <p className="mt-5 rounded-md bg-surface px-4 py-3 text-[0.8125rem] text-ink-muted hairline">
        Esta tela ainda é de consulta. A edição entra junto com a autenticação, para que só
        quem administra a loja possa mudar preço, taxa e horário.
      </p>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Card title="Identidade">
          <Row label="Nome">{store.name}</Row>
          <Row label="Assinatura">{store.tagline ?? "—"}</Row>
          <Row label="Frase">{store.headline ?? "—"}</Row>
          <Row label="Endereço na web">/{store.slug}</Row>
          <Row label="Cor de ação">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-4 rounded-xs ring-1 ring-line-strong"
                style={{ backgroundColor: store.theme.brand }}
              />
              <span className="font-mono text-[0.8125rem]">{store.theme.brand}</span>
            </span>
          </Row>
        </Card>

        <Card title="Operação">
          <Row label="Situação">
            <span className={open ? "text-success" : "text-ink-muted"}>
              {open ? "Aberta agora" : "Fechada agora"}
            </span>
          </Row>
          <Row label="Modalidades">
            {store.serviceModes.map((mode) => SERVICE_MODE_LABELS[mode]).join(" e ")}
          </Row>
          <Row label="Taxa de entrega">
            {store.deliveryFeeCents === 0 ? "Grátis" : formatCents(store.deliveryFeeCents)}
          </Row>
          <Row label="Pedido mínimo">
            {store.minOrderCents === 0 ? "Sem mínimo" : formatCents(store.minOrderCents)}
          </Row>
          <Row label="Prazo de entrega">{formatEta(store.deliveryEtaMinutes)}</Row>
          <Row label="Prazo de retirada">{formatEta(store.pickupEtaMinutes)}</Row>
        </Card>

        <Card title="Contato">
          <Row label="Telefone">{store.phone ? formatPhone(store.phone) : "—"}</Row>
          <Row label="Endereço">{store.address ?? "—"}</Row>
        </Card>

        <Card title="Pagamento">
          <Row label="Aceitos">
            <span className="flex flex-wrap gap-1.5">
              {store.paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-xs bg-surface-raised px-2 py-1 text-[0.75rem] font-medium text-ink-soft"
                >
                  {PAYMENT_LABELS[method]}
                </span>
              ))}
            </span>
          </Row>
          <Row label="Momento">Na entrega ou na retirada</Row>
        </Card>

        <Card title="Horários" className="lg:col-span-2">
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
              const windows = (byWeekday.get(weekday) ?? []).sort((a, b) =>
                a.opensAt.localeCompare(b.opensAt),
              );

              return (
                <div
                  key={weekday}
                  className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 last:border-0"
                >
                  <span className="text-[0.8125rem] text-ink-soft">{weekdayLabel(weekday)}</span>
                  <span data-price className="text-right text-[0.8125rem] text-ink-muted">
                    {windows.length === 0
                      ? "Fechado"
                      : windows.map((w) => `${w.opensAt}–${w.closesAt}`).join(" · ")}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-lg bg-surface p-5 hairline ${className ?? ""}`}>
      <h2 className="mb-4 font-display text-[1.375rem] leading-none text-ink">{title}</h2>
      <dl className="space-y-0">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="shrink-0 text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right text-[0.875rem] text-ink">{children}</dd>
    </div>
  );
}
