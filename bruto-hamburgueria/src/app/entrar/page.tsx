import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { isDemoMode } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
  // Tela de login não entra em buscador.
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string }>;
}) {
  const { de } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-[2.5rem] leading-none text-ink">Bruto</p>
          <p className="eyebrow mt-2 text-ink-muted">Administração</p>
        </div>

        <div className="rounded-lg bg-surface p-6 hairline">
          <p className="mb-5 flex items-center gap-2 text-[0.875rem] text-ink-soft">
            <Lock className="size-4 shrink-0 text-ink-faint" aria-hidden />
            Área restrita à equipe da loja.
          </p>

          <LoginForm redirectTo={de ?? "/admin"} />

          {isDemoMode() ? (
            <p className="mt-5 rounded-md bg-warning-soft px-3.5 py-3 text-[0.8125rem] leading-relaxed text-warning">
              <strong className="font-bold">Modo demonstração.</strong> A senha é{" "}
              <code className="font-mono font-bold">bruto</code>. Em produção, defina a variável
              <code className="font-mono"> ADMIN_PASSWORD</code>.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
