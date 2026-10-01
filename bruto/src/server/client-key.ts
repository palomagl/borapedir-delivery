import "server-only";
import { headers } from "next/headers";

/**
 * Identificador aproximado de quem está chamando, para o limite de taxa.
 *
 * Atrás da Vercel o IP real vem em x-forwarded-for. É aproximado de
 * propósito: dá para burlar trocando de rede, mas encarece o suficiente para
 * parar roteiro automatizado, que é o que se quer aqui.
 */
export async function clientKey(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return list.get("x-real-ip") ?? "desconhecido";
}
