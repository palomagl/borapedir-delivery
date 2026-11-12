import { NextResponse, type NextRequest } from "next/server";
import { isSessionTokenValid, SESSION_COOKIE } from "@/server/auth/session";

/**
 * Porta da administração.
 *
 * O middleware barra a navegação antes de qualquer página renderizar. Ele é a
 * primeira camada, não a única: as server actions verificam a sessão por
 * conta própria, porque um endpoint de action é chamável direto, sem passar
 * por aqui.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await isSessionTokenValid(token)) return NextResponse.next();

  const login = new URL("/entrar", request.url);
  // Guarda para onde a pessoa queria ir, e volta para lá depois de entrar.
  login.searchParams.set("de", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
