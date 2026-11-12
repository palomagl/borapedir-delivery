import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  /** Uma linha de contexto. Só entra quando diz algo que o número não diz. */
  detail?: string;
  href?: string;
  /** Destaca o cartão quando o número exige ação. */
  urgent?: boolean;
}

/**
 * Um número do dia.
 *
 * Sem gráfico, sem variação percentual inventada: a loja precisa saber quanto
 * vendeu e o que está parado esperando.
 */
export function Stat({ label, value, detail, href, urgent }: StatProps) {
  const body = (
    <>
      <p className="eyebrow text-ink-muted">{label}</p>
      <p
        data-price
        className={cn(
          "mt-2 font-display text-[2.5rem] leading-none",
          urgent ? "text-[var(--store-brand)]" : "text-ink",
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-1.5 text-[0.8125rem] text-ink-muted">{detail}</p> : null}
    </>
  );

  const className = cn(
    "block rounded-lg bg-surface p-5 hairline",
    href && "transition-colors hover:bg-surface-hover",
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
