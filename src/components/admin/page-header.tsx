/** Cabeçalho de página do admin: título, contexto e ações à direita. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-display text-[2rem] leading-none text-ink lg:text-[2.25rem]">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-[0.875rem] text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
