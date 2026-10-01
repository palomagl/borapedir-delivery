"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { Drawer } from "vaul";
import { useIsDesktop } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Uma superfície, duas composições.
 *
 * No celular vira bottom sheet arrastável — é o gesto que a pessoa espera e
 * evita ter que mirar num "X". Em telas grandes vira modal centralizado, onde
 * arrastar não faz sentido nenhum.
 *
 * O conteúdo só monta quando aberto, então o snapshot de servidor (sempre
 * "não é desktop") nunca chega a divergir do cliente.
 */

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lido por leitores de tela. Use `header` para o título visível. */
  title: string;
  description?: string;
  size?: "md" | "lg";
  /** Some com o botão de fechar quando o conteúdo já tem o seu. */
  hideClose?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SIZES = {
  md: "lg:max-w-[34rem]",
  lg: "lg:max-w-[44rem]",
} as const;

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  hideClose = false,
  className,
  children,
}: ResponsiveModalProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/72 backdrop-blur-[3px]",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            )}
          />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 flex max-h-[min(44rem,90dvh)] w-[calc(100%-3rem)]",
              "-translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden",
              "rounded-xl bg-surface shadow-lg",
              "duration-200 ease-[var(--ease-out-quint)]",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98]",
              SIZES[size],
              className,
            )}
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="sr-only">{description}</Dialog.Description>
            ) : null}

            {hideClose ? null : (
              <Dialog.Close
                aria-label="Fechar"
                className={cn(
                  "absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full",
                  "bg-paper/70 text-ink backdrop-blur-md transition-colors hover:bg-paper",
                  "shadow-sm",
                )}
              >
                <X className="size-[1.125rem]" />
              </Dialog.Close>
            )}

            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/72" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden",
            "rounded-t-xl bg-surface outline-none",
            "after:hidden",
            className,
          )}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {description ? (
            <Drawer.Description className="sr-only">{description}</Drawer.Description>
          ) : null}

          {/* Alça de arrasto: sinaliza o gesto sem ocupar espaço de conteúdo. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 flex h-6 items-center justify-center"
          >
            <span className="h-1 w-10 rounded-full bg-white/70 shadow-[0_0_0_1px_oklch(21%_0.012_55/0.06)]" />
          </div>

          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
