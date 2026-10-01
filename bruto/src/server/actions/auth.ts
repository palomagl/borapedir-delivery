"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  isPasswordValid,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/server/auth/session";
import { clientKey } from "@/server/client-key";
import { rateLimit } from "@/server/rate-limit";
import type { ActionResult } from "@/server/actions/result";

/**
 * Entrada na administração.
 *
 * O cookie é httpOnly e sameSite lax: script na página não consegue lê-lo, e
 * ele não acompanha requisição vinda de outro site.
 */
export async function signIn(password: string, redirectTo: string): Promise<ActionResult<null>> {
  // Cinco tentativas a cada cinco minutos: inviabiliza força bruta sem
  // atrapalhar quem errou a senha.
  const limit = rateLimit(`entrar:${await clientKey()}`, 5, 300);
  if (!limit.allowed) {
    return {
      ok: false,
      error: `Muitas tentativas. Aguarde ${limit.retryAfterSeconds} segundos.`,
    };
  }

  if (!isPasswordValid(password)) {
    // Mensagem única de propósito: não conta se o erro foi usuário ou senha.
    return { ok: false, error: "Senha incorreta." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Só aceita caminho interno: um "de" vindo da URL não pode virar
  // redirecionamento para fora do site.
  const safe = redirectTo.startsWith("/admin") ? redirectTo : "/admin";
  redirect(safe);
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/entrar");
}
