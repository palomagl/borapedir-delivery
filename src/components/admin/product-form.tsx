"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import type { z } from "zod";
import { toast } from "sonner";
import { ProductImage } from "@/components/store/product-image";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { formatCentsBare } from "@/domain/money";
import { productSchema } from "@/domain/schemas";
import type { Category, Product } from "@/domain/types";
import { saveProduct } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

/**
 * Criar e editar produto.
 *
 * Os grupos de opção não entram aqui: editar um adicional é outro problema,
 * com outra tela. Esta salva só os campos do produto e preserva o que já
 * existe — mudar o nome não pode apagar os adicionais.
 */

/**
 * O schema transforma texto em centavos, então a entrada e a saída dele são
 * tipos diferentes: o formulário manipula a entrada (preço como "38,90") e o
 * servidor recebe exatamente isso — quem converte é o parse de lá.
 */
type FormValues = z.input<typeof productSchema>;
type ParsedValues = z.output<typeof productSchema>;

/** "Bruto Bacon" → "bruto-bacon" */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  storeSlug,
  categories,
  product,
}: {
  storeSlug: string;
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  // Enquanto o nome e o endereço andam juntos, digitar o nome atualiza os dois.
  const [slugTouched, setSlugTouched] = React.useState(Boolean(product));

  const form = useForm<FormValues, unknown, ParsedValues>({
    resolver: zodResolver(productSchema),
    mode: "onTouched",
    defaultValues: {
      id: product?.id,
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      imageUrl: product?.imageUrl ?? "",
      priceCents: product ? formatCentsBare(product.priceCents) : "",
      promoPriceCents: product?.promoPriceCents ? formatCentsBare(product.promoPriceCents) : "",
      available: product?.available ?? true,
      featured: product?.featured ?? false,
    },
  });

  // useWatch assina o campo em vez de devolver uma função nova a cada render.
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  async function onSubmit() {
    // Manda o texto cru: validar e converter é responsabilidade do servidor,
    // com o mesmo schema. Enviar o valor já convertido faria o parse de lá
    // recusar a própria saída.
    setSubmitting(true);
    const result = await saveProduct(storeSlug, form.getValues());
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(path as Path<FormValues>, { message });
      }
      return;
    }

    toast.success(product ? "Produto salvo" : "Produto criado");
    router.push(`/admin/${storeSlug}/produtos`);
    router.refresh();
  }

  const error = (name: keyof FormValues) => form.formState.errors[name]?.message;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl">
      <div className="grid gap-5 rounded-lg bg-surface p-5 hairline lg:p-6">
        <Field label="Nome" htmlFor="name" error={error("name")}>
          <Input
            id="name"
            autoFocus
            aria-invalid={error("name") ? true : undefined}
            {...form.register("name", {
              onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                if (!slugTouched) form.setValue("slug", slugify(event.target.value));
              },
            })}
          />
        </Field>

        <Field
          label="Endereço no cardápio"
          htmlFor="slug"
          error={error("slug")}
          hint={`/${storeSlug} · usado no link do produto`}
        >
          <Input
            id="slug"
            aria-invalid={error("slug") ? true : undefined}
            {...form.register("slug", { onChange: () => setSlugTouched(true) })}
          />
        </Field>

        <Field label="Categoria" htmlFor="categoryId" error={error("categoryId")}>
          <select
            id="categoryId"
            aria-invalid={error("categoryId") ? true : undefined}
            className={cn(
              "h-12 w-full rounded-md bg-surface px-3.5 text-[0.9375rem] text-ink hairline",
              "focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--store-brand)]",
            )}
            {...form.register("categoryId")}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descrição" htmlFor="description" optional error={error("description")}>
          <Textarea
            id="description"
            rows={3}
            maxLength={400}
            placeholder="O que vai no prato, na ordem em que a pessoa morde."
            {...form.register("description")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preço" htmlFor="priceCents" error={error("priceCents")} hint="Ex.: 38,90">
            <Input
              id="priceCents"
              inputMode="decimal"
              aria-invalid={error("priceCents") ? true : undefined}
              {...form.register("priceCents")}
            />
          </Field>

          <Field
            label="Preço promocional"
            htmlFor="promoPriceCents"
            optional
            error={error("promoPriceCents")}
            hint="Deixe vazio se não houver"
          >
            <Input
              id="promoPriceCents"
              inputMode="decimal"
              aria-invalid={error("promoPriceCents") ? true : undefined}
              {...form.register("promoPriceCents")}
            />
          </Field>
        </div>

        <Field
          label="Imagem"
          htmlFor="imageUrl"
          optional
          error={error("imageUrl")}
          hint="Caminho local (/seed/…) ou URL do Supabase Storage"
        >
          <div className="flex items-start gap-3">
            <Input id="imageUrl" {...form.register("imageUrl")} />
            <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-paper-sunken">
              <ProductImage src={imageUrl || null} alt="" sizes="48px" />
            </span>
          </div>
        </Field>

        <div className="space-y-3 border-t border-line pt-5">
          <Checkbox
            id="available"
            label="Disponível no cardápio"
            description="Desligue quando acabar o item."
            {...form.register("available")}
          />
          <Checkbox
            id="featured"
            label="Aparece nos mais pedidos"
            description="Entra na faixa de destaques do topo."
            {...form.register("featured")}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <Button type="submit" size="lg" loading={submitting}>
          <Save />
          {product ? "Salvar alterações" : "Criar produto"}
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href={`/admin/${storeSlug}/produtos`}>
            <ArrowLeft />
            Cancelar
          </Link>
        </Button>
      </div>
    </form>
  );
}

function Checkbox({
  id,
  label,
  description,
  ref,
  ...props
}: { id: string; label: string; description: string } & React.ComponentProps<"input">) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" ref={ref} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs border-2 border-line-strong transition-colors",
          "peer-checked:border-[var(--store-brand)] peer-checked:bg-[var(--store-brand)]",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--store-brand)]",
          // O sinal só existe quando marcado; senão some no fundo escuro.
          "[&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100",
        )}
      >
        <svg viewBox="0 0 14 14" className="size-3.5 text-[var(--store-brand-contrast)]" fill="none">
          <path
            d="M2.5 7.5 5.5 10.5 11.5 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        <span className="block text-[0.9375rem] font-semibold text-ink">{label}</span>
        <span className="block text-[0.8125rem] text-ink-muted">{description}</span>
      </span>
    </label>
  );
}
