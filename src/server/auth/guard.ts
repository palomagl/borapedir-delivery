import "server-only";
import { cookies } from "next/headers";
import { isSessionTokenValid, SESSION_COOKIE } from "@/server/auth/session";

/**
 * Verificação de sessão dentro da server action.
 *
 * O middleware protege a navegação, mas o endpoint de uma server action é
 * chamável diretamente por quem souber o identificador dela. Toda ação que
 * escreve passa por aqui antes de tocar em dado.
 */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return isSessionTokenValid(store.get(SESSION_COOKIE)?.value);
}
