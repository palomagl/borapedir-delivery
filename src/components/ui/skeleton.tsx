import { cn } from "@/lib/utils";

/** Reserva espaço com a forma exata do conteúdo — nunca um bloco genérico. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-sm bg-paper-sunken", className)}
      {...props}
    />
  );
}
