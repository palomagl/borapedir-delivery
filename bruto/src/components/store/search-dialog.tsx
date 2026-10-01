"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import { ProductImage } from "@/components/store/product-image";
import { useProductModal } from "@/components/store/product-modal";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { effectivePriceCents } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import type { Product } from "@/domain/types";

/** "Pão" e "pao" precisam achar a mesma coisa. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function search(products: Product[], term: string): Product[] {
  const query = normalize(term.trim());
  if (query.length < 2) return [];

  const words = query.split(/\s+/);
  return products
    .filter((product) => {
      const haystack = normalize(`${product.name} ${product.description ?? ""}`);
      return words.every((word) => haystack.includes(word));
    })
    .slice(0, 12);
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

export function SearchDialog({ open, onOpenChange, products }: SearchDialogProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar no cardápio"
      hideClose
      className="lg:max-w-[32rem]"
    >
      {/* Montar o corpo só quando aberto zera o termo digitado de graça. */}
      {open ? <SearchBody onClose={() => onOpenChange(false)} products={products} /> : null}
    </ResponsiveModal>
  );
}

function SearchBody({ onClose, products }: { onClose: () => void; products: Product[] }) {
  const [term, setTerm] = React.useState("");
  const { open: openProduct } = useProductModal();

  const results = search(products, term);
  const searching = term.trim().length >= 2;

  function choose(product: Product) {
    onClose();
    // Deixa a folha de busca sair de cena antes de abrir a do produto.
    window.setTimeout(() => openProduct(product), 160);
  }

  return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 pb-3 pt-6 lg:pt-4">
          <Search className="ml-1.5 size-[1.125rem] shrink-0 text-ink-faint" aria-hidden />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="O que você procura?"
            aria-label="Buscar no cardápio"
            className="h-10 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <X className="size-[1.125rem]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 safe-b">
          {!searching ? (
            <p className="px-3 py-10 text-center text-sm text-ink-muted">
              Digite ao menos duas letras para buscar.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-ink-muted">
              Nada encontrado para <span className="font-semibold text-ink">{term.trim()}</span>.
            </p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => choose(product)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface-hover"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-paper-sunken">
                      <ProductImage
                        src={product.imageUrl}
                        alt=""
                        sizes="48px"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] font-semibold text-ink">
                        {product.name}
                      </span>
                      {product.description ? (
                        <span className="clamp-1 block text-[0.8125rem] text-ink-muted">
                          {product.description}
                        </span>
                      ) : null}
                    </span>
                    <span
                      data-price
                      className="shrink-0 text-[0.9375rem] font-bold text-ink"
                    >
                      {formatCents(effectivePriceCents(product))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  );
}
