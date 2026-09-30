"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Banknote,
  Bike,
  Check,
  CreditCard,
  QrCode,
  Store as StoreIcon,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm, useWatch, type Control, type Path } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CartSummary } from "@/components/store/cart-items";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { lineTotalCents } from "@/domain/cart";
import { formatCents } from "@/domain/money";
import { addressSchema, phoneSchema } from "@/domain/schemas";
import type { PaymentMethod, ServiceMode } from "@/domain/types";
import { formatPhone, PAYMENT_LABELS } from "@/lib/format";
import { rememberOrder } from "@/lib/my-orders";
import { createOrder } from "@/server/actions/orders";
import { cn } from "@/lib/utils";

/**
 * Checkout em quatro passos curtos.
 *
 * Um formulário só por baixo; o que muda é o que está visível. Assim o
 * usuário pode voltar sem perder nada e a validação continua sendo uma regra
 * só, compartilhada com o servidor.
 */

const STEPS = [
  { id: "entrega", label: "Entrega" },
  { id: "contato", label: "Contato" },
  { id: "pagamento", label: "Pagamento" },
  { id: "revisao", label: "Revisão" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const formSchema = z
  .object({
    serviceMode: z.enum(["delivery", "pickup"]),
    customerName: z.string().trim().min(2, "Informe seu nome").max(80),
    customerPhone: phoneSchema,
    address: addressSchema.partial().optional(),
    paymentMethod: z.enum(["pix", "credit", "debit", "cash", "meal_voucher"]),
    changeFor: z.string().trim().optional(),
    note: z.string().trim().max(240).optional(),
  })
  // Endereço só é exigido quando o pedido é entregue — e aí cada campo
  // aponta o próprio erro, em vez de um aviso genérico no topo.
  .superRefine((data, ctx) => {
    if (data.serviceMode !== "delivery") return;

    const required = [
      ["street", "Informe a rua"],
      ["number", "Informe o número"],
      ["district", "Informe o bairro"],
      ["city", "Informe a cidade"],
      ["state", "Informe a UF"],
    ] as const;

    for (const [field, message] of required) {
      const value = data.address?.[field];
      if (!value || value.trim() === "") {
        ctx.addIssue({ code: "custom", path: ["address", field], message });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<StepId, Path<FormValues>[]> = {
  entrega: ["serviceMode", "address.street", "address.number", "address.district", "address.city", "address.state"],
  contato: ["customerName", "customerPhone"],
  pagamento: ["paymentMethod", "changeFor"],
  revisao: [],
};

const PAYMENT_ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  pix: QrCode,
  credit: CreditCard,
  debit: CreditCard,
  cash: Banknote,
  meal_voucher: Ticket,
};

export function CheckoutForm() {
  const { store, lines, totals, serviceMode, setServiceMode, clearCart, hydrated, isOpen } =
    useStore();
  const router = useRouter();

  const [step, setStep] = React.useState<StepId>("entrega");
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      serviceMode,
      customerName: "",
      customerPhone: "",
      address: { street: "", number: "", complement: "", district: "", city: "", state: "", zipCode: "", reference: "" },
      paymentMethod: store.paymentMethods[0],
      changeFor: "",
      note: "",
    },
  });

  // useWatch assina o campo em vez de devolver uma função nova a cada render,
  // que é o que o compilador do React não consegue memoizar com segurança.
  const control = form.control;
  const mode = useWatch({ control, name: "serviceMode" });
  const payment = useWatch({ control, name: "paymentMethod" });

  // A sacola vazia não tem checkout. Volta ao cardápio em vez de travar.
  React.useEffect(() => {
    if (hydrated && lines.length === 0 && !submitting) {
      router.replace(`/${store.slug}`);
    }
  }, [hydrated, lines.length, router, store.slug, submitting]);

  const stepIndex = STEPS.findIndex((candidate) => candidate.id === step);

  async function goNext() {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!valid) return;

    const next = STEPS[stepIndex + 1];
    if (next) {
      setStep(next.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    const previous = STEPS[stepIndex - 1];
    if (previous) {
      setStep(previous.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);

    const result = await createOrder(store.slug, {
      ...values,
      address: values.serviceMode === "delivery" ? values.address : null,
      note: values.note || null,
      changeFor: values.paymentMethod === "cash" ? values.changeFor || null : null,
      items: lines.map((line) => ({
        productId: line.productId,
        optionIds: line.selections.map((selection) => selection.optionId),
        quantity: line.quantity,
        note: line.note,
      })),
    });

    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [path, message] of Object.entries(result.fieldErrors)) {
          form.setError(path as Path<FormValues>, { message });
        }
      }
      return;
    }

    rememberOrder(store.slug, result.data.orderId);
    clearCart();
    router.push(`/${store.slug}/pedidos/${result.data.orderId}?novo=1`);
  }

  function selectMode(next: ServiceMode) {
    form.setValue("serviceMode", next);
    setServiceMode(next);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl px-4 pb-32 pt-5 lg:px-8 lg:pb-16 lg:pt-8"
    >
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link href={`/${store.slug}/sacola`} aria-label="Voltar para a sacola">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-[2rem] leading-none text-ink lg:text-[2.25rem]">
          Finalizar pedido
        </h1>
      </div>

      <Stepper steps={STEPS} currentIndex={stepIndex} />

      {!isOpen ? (
        <p className="mt-5 rounded-md bg-warning-soft px-4 py-3 text-[0.8125rem] font-medium text-warning">
          A loja não está recebendo pedidos agora. Volte no horário de funcionamento — sua
          sacola continua aqui.
        </p>
      ) : null}

      <div className="mt-6 rounded-lg bg-surface p-4 hairline lg:p-6">
        {step === "entrega" ? (
          <section aria-labelledby="passo-entrega">
            <StepTitle id="passo-entrega">Como você quer receber?</StepTitle>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {store.serviceModes.map((candidate) => {
                const Icon = candidate === "delivery" ? Bike : StoreIcon;
                const active = mode === candidate;

                return (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => selectMode(candidate)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start gap-3 rounded-md p-3.5 text-left transition-all",
                      active
                        ? "bg-brand-soft shadow-[inset_0_0_0_1.5px_var(--store-brand)]"
                        : "bg-surface hairline hover:bg-surface-hover",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        active ? "text-[var(--store-brand)]" : "text-ink-faint",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] font-bold text-ink">
                        {candidate === "delivery" ? "Entrega" : "Retirada"}
                      </span>
                      <span data-price className="mt-0.5 block text-[0.8125rem] text-ink-muted">
                        {candidate === "delivery"
                          ? `${store.deliveryEtaMinutes[0]}–${store.deliveryEtaMinutes[1]} min · ${store.deliveryFeeCents === 0 ? "grátis" : formatCents(store.deliveryFeeCents)}`
                          : `${store.pickupEtaMinutes[0]}–${store.pickupEtaMinutes[1]} min · sem taxa`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {mode === "delivery" ? (
              <div className="mt-6 space-y-4">
                <h3 className="text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">
                  Endereço de entrega
                </h3>

                <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                  <TextField form={form} name="address.street" label="Rua" autoComplete="address-line1" />
                  <TextField form={form} name="address.number" label="Número" inputMode="numeric" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    form={form}
                    name="address.complement"
                    label="Complemento"
                    optional
                    placeholder="Apto, bloco, casa"
                  />
                  <TextField form={form} name="address.district" label="Bairro" />
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_5rem_8rem]">
                  <TextField form={form} name="address.city" label="Cidade" />
                  <TextField form={form} name="address.state" label="UF" maxLength={2} />
                  <TextField
                    form={form}
                    name="address.zipCode"
                    label="CEP"
                    optional
                    inputMode="numeric"
                    placeholder="00000-000"
                  />
                </div>

                <TextField
                  form={form}
                  name="address.reference"
                  label="Ponto de referência"
                  optional
                  placeholder="Portão azul, ao lado da padaria"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-md bg-paper-sunken p-4">
                <p className="text-[0.875rem] font-semibold text-ink">Retirar em</p>
                <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-soft">
                  {store.address ?? store.name}
                </p>
              </div>
            )}
          </section>
        ) : null}

        {step === "contato" ? (
          <section aria-labelledby="passo-contato">
            <StepTitle id="passo-contato">Quem vai receber?</StepTitle>
            <p className="mt-1 text-[0.875rem] text-ink-muted">
              A loja usa esses dados para falar com você sobre o pedido.
            </p>

            <div className="mt-5 space-y-4">
              <TextField
                form={form}
                name="customerName"
                label="Nome completo"
                autoComplete="name"
                placeholder="Como devemos te chamar"
              />
              <TextField
                form={form}
                name="customerPhone"
                label="Telefone com DDD"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(51) 99999-0000"
                format={formatPhone}
              />
            </div>
          </section>
        ) : null}

        {step === "pagamento" ? (
          <section aria-labelledby="passo-pagamento">
            <StepTitle id="passo-pagamento">Como quer pagar?</StepTitle>
            <p className="mt-1 text-[0.875rem] text-ink-muted">
              O pagamento é feito na entrega ou na retirada.
            </p>

            <div className="mt-5 overflow-hidden rounded-md hairline">
              {store.paymentMethods.map((method, index) => {
                const Icon = PAYMENT_ICONS[method];
                const active = payment === method;

                return (
                  <label
                    key={method}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3.5 py-3.5 transition-colors",
                      index > 0 && "border-t border-line",
                      active ? "bg-brand-soft/60" : "hover:bg-surface-hover",
                    )}
                  >
                    <input
                      type="radio"
                      value={method}
                      checked={active}
                      onChange={() => form.setValue("paymentMethod", method)}
                      className="peer sr-only"
                      name="paymentMethod"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-line-strong transition-colors",
                        active && "border-[var(--store-brand)] bg-[var(--store-brand)]",
                        "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--store-brand)]",
                      )}
                    >
                      {active ? (
                        <span className="size-2 rounded-full bg-[var(--store-brand-contrast)]" />
                      ) : null}
                    </span>
                    <Icon className="size-[1.125rem] shrink-0 text-ink-faint" aria-hidden />
                    <span className="text-[0.9375rem] text-ink">{PAYMENT_LABELS[method]}</span>
                  </label>
                );
              })}
            </div>

            {payment === "cash" ? (
              <div className="mt-4">
                <TextField
                  form={form}
                  name="changeFor"
                  label="Precisa de troco para quanto?"
                  optional
                  inputMode="decimal"
                  placeholder={formatCents(totals.totalCents)}
                  hint="Deixe em branco se tiver o valor exato."
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {step === "revisao" ? (
          <section aria-labelledby="passo-revisao">
            <StepTitle id="passo-revisao">Confira antes de enviar</StepTitle>

            <ul className="mt-4 divide-y divide-line">
              {lines.map((line) => (
                <li key={line.key} className="flex items-baseline justify-between gap-3 py-2.5">
                  <span className="min-w-0 text-[0.875rem] text-ink">
                    <span data-price className="font-bold">
                      {line.quantity}×
                    </span>{" "}
                    {line.productName}
                    {line.selections.length > 0 ? (
                      <span className="block text-[0.8125rem] text-ink-muted">
                        {line.selections.map((selection) => selection.optionName).join(" · ")}
                      </span>
                    ) : null}
                  </span>
                  <span data-price className="shrink-0 text-[0.875rem] font-semibold text-ink">
                    {formatCents(lineTotalCents(line))}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-line pt-4">
              <CartSummary />
            </div>

            <div className="mt-5">
              <label htmlFor="order-note" className="text-[0.8125rem] font-semibold text-ink">
                Observação do pedido
              </label>
              <Textarea
                id="order-note"
                rows={2}
                maxLength={240}
                className="mt-1.5"
                placeholder="Ex.: interfone quebrado, ligar ao chegar"
                {...form.register("note")}
              />
            </div>

            <dl className="mt-5 space-y-2 rounded-md bg-paper-sunken p-4 text-[0.8125rem]">
              <ReviewRow label="Entrega">
                {mode === "delivery" ? <WatchedAddress control={control} /> : `Retirada em ${store.address ?? store.name}`}
              </ReviewRow>
              <ReviewRow label="Contato">
                <WatchedContact control={control} />
              </ReviewRow>
              <ReviewRow label="Pagamento">{PAYMENT_LABELS[payment]}</ReviewRow>
            </dl>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-line bg-surface/95 px-4 pb-3 pt-3 backdrop-blur-xl safe-b lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {stepIndex > 0 ? (
          <Button type="button" variant="outline" size="lg" onClick={goBack}>
            <ArrowLeft />
            <span className="sr-only sm:not-sr-only">Voltar</span>
          </Button>
        ) : null}

        {step === "revisao" ? (
          <Button type="submit" size="lg" className="flex-1" loading={submitting} disabled={!isOpen}>
            <Check />
            <span>Confirmar pedido</span>
            <span aria-hidden className="opacity-50">
              ·
            </span>
            <span data-price>{formatCents(totals.totalCents)}</span>
          </Button>
        ) : (
          <Button type="button" size="lg" className="flex-1" onClick={goNext}>
            Continuar
          </Button>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ Apoio */

/** Lê os campos do endereço na etapa de revisão, sem recriar funções. */
function WatchedAddress({ control }: { control: Control<FormValues> }) {
  const address = useWatch({ control, name: "address" });
  if (!address) return null;
  return (
    <>
      {address.street}, {address.number} — {address.district}
    </>
  );
}

function WatchedContact({ control }: { control: Control<FormValues> }) {
  const name = useWatch({ control, name: "customerName" });
  const phone = useWatch({ control, name: "customerPhone" });
  return (
    <>
      {name} · {formatPhone(phone ?? "")}
    </>
  );
}

function StepTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-[1.5rem] leading-none text-ink">
      {children}
    </h2>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 font-semibold text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-ink">{children}</dd>
    </div>
  );
}

function Stepper({
  steps,
  currentIndex,
}: {
  steps: readonly { id: string; label: string }[];
  currentIndex: number;
}) {
  return (
    <ol className="mt-5 flex items-center gap-1.5" aria-label="Etapas do pedido">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;

        return (
          <li key={step.id} className="flex flex-1 flex-col gap-1.5">
            <span
              aria-hidden
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                done || current ? "bg-[var(--store-brand)]" : "bg-line",
              )}
            />
            <span
              className={cn(
                "text-[0.6875rem] font-semibold tracking-[0.01em]",
                current ? "text-ink" : done ? "text-ink-muted" : "text-ink-faint",
              )}
              aria-current={current ? "step" : undefined}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Campo de texto ligado ao react-hook-form, com máscara opcional. */
function TextField({
  form,
  name,
  label,
  optional,
  hint,
  format,
  ...props
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: Path<FormValues>;
  label: string;
  optional?: boolean;
  hint?: string;
  format?: (value: string) => string;
} & Omit<React.ComponentProps<"input">, "form" | "name">) {
  const id = name.replace(/\./g, "-");
  const error = name
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], form.formState.errors);
  const message = (error as { message?: string } | undefined)?.message;

  const registration = form.register(name);

  return (
    <Field label={label} htmlFor={id} optional={optional} hint={hint} error={message}>
      <Input
        id={id}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
        {...registration}
        onChange={(event) => {
          if (format) event.target.value = format(event.target.value);
          void registration.onChange(event);
        }}
      />
    </Field>
  );
}
