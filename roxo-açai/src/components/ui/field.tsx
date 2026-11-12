import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md bg-surface px-3.5 text-[0.9375rem] text-ink hairline",
        "placeholder:text-ink-faint",
        "transition-shadow duration-150",
        "focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--store-brand)]",
        "disabled:bg-paper-sunken disabled:text-ink-muted",
        "aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_var(--color-danger)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-md bg-surface px-3.5 py-3 text-[0.9375rem] leading-relaxed text-ink hairline",
        "placeholder:text-ink-faint",
        "transition-shadow duration-150",
        "focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--store-brand)]",
        className,
      )}
      {...props}
    />
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Rótulo, dica e erro sempre no mesmo lugar, com as ligações de aria prontas. */
export function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[0.8125rem] font-semibold text-ink">
          {label}
        </label>
        {optional ? <span className="text-xs text-ink-faint">opcional</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
