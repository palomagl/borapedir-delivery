"use client";

import { ArrowRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signIn } from "@/server/actions/auth";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");

    setError(null);
    setPending(true);

    // Em caso de sucesso a action redireciona e esta linha não volta.
    const result = await signIn(String(password ?? ""), redirectTo);

    setPending(false);
    if (result && !result.ok) setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Senha" htmlFor="password" error={error ?? undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
        />
      </Field>

      <Button type="submit" size="lg" block loading={pending}>
        Entrar
        <ArrowRight />
      </Button>
    </form>
  );
}
