"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ProductImage } from "@/components/store/product-image";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Textarea } from "@/components/ui/field";
import type { CartSelection } from "@/domain/cart";
import { validateSelections } from "@/domain/cart";
import {
  effectivePriceCents,
  groupHelperText,
  hasPromo,
  isGroupRequired,
  isSingleChoice,
} from "@/domain/catalog";
import { formatCents, formatDelta, sumCents } from "@/domain/money";
import type { OptionGroup, Product, ProductOption } from "@/domain/types";
import { cn } from "@/lib/utils";

/**
 * Configuração do produto.
 *
 * Um só ponto de montagem para a folha, compartilhado por toda a loja: as
 * linhas do cardápio só pedem "abra este produto". Sem isso teríamos uma
 * instância de modal por item da lista.
 */

interface EditTarget {
  key: string;
  selections: CartSelection[];
  note: string | null;
  quantity: number;
}

interface ProductModalContextValue {
  open: (product: Product, edit?: EditTarget) => void;
}

const ProductModalContext = React.createContext<ProductModalContextValue | null>(null);

export function useProductModal(): ProductModalContextValue {
  const context = React.useContext(ProductModalContext);
  if (!context) throw new Error("useProductModal precisa estar dentro de ProductModalProvider");
  return context;
}

export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ product: Product; edit?: EditTarget } | null>(null);

  const open = React.useCallback((product: Product, edit?: EditTarget) => {
    setState({ product, edit });
  }, []);

  const value = React.useMemo(() => ({ open }), [open]);

  return (
    <ProductModalContext.Provider value={value}>
      {children}
      <ResponsiveModal
        open={state !== null}
        onOpenChange={(next) => {
          if (!next) setState(null);
        }}
        title={state?.product.name ?? "Produto"}
        description={state?.product.description ?? undefined}
        size="md"
      >
        {state ? (
          <ProductForm
            key={state.product.id + (state.edit?.key ?? "")}
            product={state.product}
            edit={state.edit}
            onDone={() => setState(null)}
          />
        ) : null}
      </ResponsiveModal>
    </ProductModalContext.Provider>
  );
}

/* --------------------------------------------------------------- Formulário */

/**
 * Grupo obrigatório de escolha única já vem com a primeira opção sem acréscimo
 * marcada. Tira um toque do caminho sem nunca escolher algo que custe a mais.
 */
function initialSelections(product: Product, edit?: EditTarget): CartSelection[] {
  if (edit) return edit.selections;

  return product.optionGroups.flatMap((group) => {
    if (!isGroupRequired(group) || !isSingleChoice(group)) return [];
    const free = group.options.find((option) => option.available && option.priceDeltaCents === 0);
    if (!free) return [];
    return [toSelection(group, free)];
  });
}

function toSelection(group: OptionGroup, option: ProductOption): CartSelection {
  return {
    groupId: group.id,
    groupName: group.name,
    optionId: option.id,
    optionName: option.name,
    priceDeltaCents: option.priceDeltaCents,
  };
}

interface ProductFormProps {
  product: Product;
  edit?: EditTarget;
  onDone: () => void;
}

function ProductForm({ product, edit, onDone }: ProductFormProps) {
  const { addItem, removeItem } = useStore();

  const [selections, setSelections] = React.useState<CartSelection[]>(() =>
    initialSelections(product, edit),
  );
  const [note, setNote] = React.useState(edit?.note ?? "");
  const [quantity, setQuantity] = React.useState(edit?.quantity ?? 1);
  const [attempted, setAttempted] = React.useState(false);

  const groupRefs = React.useRef(new Map<string, HTMLFieldSetElement>());

  const errors = validateSelections(product, selections);
  const errorByGroup = new Map(errors.map((error) => [error.groupId, error.message]));

  const unitCents =
    effectivePriceCents(product) + sumCents(selections.map((s) => s.priceDeltaCents));
  const totalCents = unitCents * quantity;

  function toggle(group: OptionGroup, option: ProductOption) {
    setSelections((current) => {
      const others = current.filter((selection) => selection.groupId !== group.id);
      const chosen = current.filter((selection) => selection.groupId === group.id);
      const already = chosen.some((selection) => selection.optionId === option.id);

      if (isSingleChoice(group)) {
        return already && !isGroupRequired(group)
          ? others
          : [...others, toSelection(group, option)];
      }

      if (already) {
        return [...others, ...chosen.filter((selection) => selection.optionId !== option.id)];
      }
      // Cheio: o toque não faz nada em vez de trocar algo pelas costas do usuário.
      if (chosen.length >= group.maxSelect) return current;

      return [...others, ...chosen, toSelection(group, option)];
    });
  }

  function handleSubmit() {
    if (errors.length > 0) {
      setAttempted(true);
      const target = groupRefs.current.get(errors[0].groupId);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (edit) removeItem(edit.key);
    addItem(product, selections, note, quantity);

    toast.success(edit ? "Item atualizado" : `${product.name} na sacola`);
    onDone();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative aspect-[16/10] w-full bg-paper-sunken lg:aspect-[2/1]">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(min-width: 1024px) 544px, 100vw"
            priority
          />
        </div>

        <div className="px-5 pb-6 pt-5 lg:px-7">
          <h2 className="font-display text-[1.875rem] leading-none text-ink lg:text-[2.125rem]">
            {product.name}
          </h2>

          {product.description ? (
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
              {product.description}
            </p>
          ) : null}

          <div className="mt-3 flex items-baseline gap-2.5">
            <span data-price className="text-lg font-bold tracking-[-0.02em] text-ink">
              {formatCents(effectivePriceCents(product))}
            </span>
            {hasPromo(product) ? (
              <span data-price className="text-sm text-ink-muted line-through">
                {formatCents(product.priceCents)}
              </span>
            ) : null}
          </div>

          {product.optionGroups.map((group) => (
            <OptionGroupFieldset
              key={group.id}
              ref={(node) => {
                if (node) groupRefs.current.set(group.id, node);
                else groupRefs.current.delete(group.id);
              }}
              group={group}
              selections={selections}
              error={attempted ? errorByGroup.get(group.id) : undefined}
              onToggle={toggle}
            />
          ))}

          <div className="mt-7">
            <label
              htmlFor="product-note"
              className="text-[0.9375rem] font-bold tracking-[-0.01em] text-ink"
            >
              Observação
            </label>
            <p className="mb-2.5 mt-0.5 text-[0.8125rem] text-ink-muted">
              Alguma preferência? Conte para a cozinha.
            </p>
            <Textarea
              id="product-note"
              rows={2}
              maxLength={180}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex.: sem cebola, ponto bem passado"
            />
          </div>
        </div>
      </div>

      {/* Rodapé fixo: quantidade e valor final sempre à vista, sem rolar. */}
      <div className="shrink-0 border-t border-line bg-surface px-5 py-3.5 safe-b lg:px-7 lg:py-4">
        <div className="flex items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} />
          <Button size="lg" className="flex-1" onClick={handleSubmit}>
            <span>{edit ? "Salvar" : "Adicionar"}</span>
            <span aria-hidden className="opacity-50">
              ·
            </span>
            <span data-price>{formatCents(totalCents)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Grupo de opções */

interface OptionGroupFieldsetProps {
  group: OptionGroup;
  selections: CartSelection[];
  error?: string;
  onToggle: (group: OptionGroup, option: ProductOption) => void;
  ref?: React.Ref<HTMLFieldSetElement>;
}

function OptionGroupFieldset({
  group,
  selections,
  error,
  onToggle,
  ref,
}: OptionGroupFieldsetProps) {
  const chosen = selections.filter((selection) => selection.groupId === group.id);
  const single = isSingleChoice(group);
  const required = isGroupRequired(group);
  const full = !single && chosen.length >= group.maxSelect;

  return (
    <fieldset ref={ref} className="mt-7 scroll-mt-6">
      <legend className="sr-only">{group.name}</legend>

      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">{group.name}</p>
          <p
            className={cn(
              "mt-0.5 text-[0.8125rem]",
              error ? "font-medium text-danger" : "text-ink-muted",
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? groupHelperText(group)}
          </p>
        </div>

        {required ? (
          <span className="shrink-0 rounded-full bg-paper-sunken px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.04em] text-ink-soft">
            Obrigatório
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-md bg-surface hairline",
          error && "shadow-[inset_0_0_0_1.5px_var(--color-danger)]",
        )}
      >
        {group.options.map((option, index) => {
          const isChosen = chosen.some((selection) => selection.optionId === option.id);
          const disabled = !option.available || (full && !isChosen);

          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-3.5 py-3 transition-colors",
                index > 0 && "border-t border-line",
                disabled ? "cursor-not-allowed opacity-45" : "hover:bg-surface-hover",
                isChosen && "bg-brand-soft/60",
              )}
            >
              <input
                type={single ? "radio" : "checkbox"}
                name={group.id}
                checked={isChosen}
                disabled={disabled}
                onChange={() => onToggle(group, option)}
                className="peer sr-only"
              />

              <span
                aria-hidden
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center border-2 border-line-strong transition-colors",
                  single ? "rounded-full" : "rounded-[0.3rem]",
                  isChosen && "border-[var(--store-brand)] bg-[var(--store-brand)]",
                  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--store-brand)]",
                )}
              >
                {isChosen ? (
                  single ? (
                    <span className="size-2 rounded-full bg-[var(--store-brand-contrast)]" />
                  ) : (
                    <Check className="size-3.5 text-[var(--store-brand-contrast)]" strokeWidth={3.5} />
                  )
                ) : null}
              </span>

              <span className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-ink">
                {option.name}
                {option.available ? null : (
                  <span className="ml-1.5 text-[0.8125rem] text-ink-muted">· esgotado</span>
                )}
              </span>

              {option.priceDeltaCents !== 0 ? (
                <span
                  data-price
                  className="shrink-0 text-[0.8125rem] font-semibold text-ink-soft"
                >
                  {formatDelta(option.priceDeltaCents)}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
