import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A cor de ação vem de --store-brand, definida pela loja. O mesmo botão
 * fica laranja numa hamburgueria e verde numa cafeteria, sem recompilar nada.
 */
const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold tracking-[-0.01em] select-none",
    "transition-[background-color,box-shadow,color,transform] duration-150 ease-[var(--ease-out-quint)]",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 disabled:active:scale-100",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--store-brand)] text-[var(--store-brand-contrast)] shadow-xs hover:brightness-[0.94] hover:shadow-brand",
        ink: "bg-ink text-paper shadow-xs hover:bg-ink/88",
        soft: "bg-brand-soft text-[var(--store-brand)] hover:bg-brand-soft-hover",
        outline: "bg-transparent text-ink hairline hover:bg-surface-hover",
        ghost: "text-ink-soft hover:bg-surface-hover hover:text-ink",
        danger: "bg-danger-soft text-danger hover:bg-danger hover:text-paper",
      },
      size: {
        sm: "h-9 rounded-sm px-3.5 text-[0.8125rem] [&_svg]:size-4",
        md: "h-11 rounded-md px-5 text-[0.9375rem] [&_svg]:size-[1.125rem]",
        lg: "h-[3.25rem] rounded-md px-6 text-base [&_svg]:size-5",
        icon: "size-10 rounded-sm [&_svg]:size-[1.125rem]",
        "icon-sm": "size-8 rounded-xs [&_svg]:size-4",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          {/* Mantém a largura do botão estável durante o carregamento. */}
          <span className="invisible contents">{children}</span>
          <Loader2 className="absolute animate-spin" aria-hidden />
          <span className="sr-only">Carregando</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { buttonVariants };
