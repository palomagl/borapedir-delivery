import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Clientes do Supabase, separados por privilégio.
 *
 * `publicClient` usa a chave anônima e respeita RLS — serve para o catálogo,
 * que é público por policy.
 *
 * `serviceClient` ignora RLS e existe para duas coisas que o navegador não
 * pode fazer: gravar pedido com preço calculado no servidor e ler pedido de
 * quem comprou sem conta. Quando a autenticação entrar, a leitura do admin
 * passa a usar a sessão do usuário e este cliente encolhe para só a escrita.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} não está definida. Defina as variáveis do Supabase ou remova ` +
        "NEXT_PUBLIC_SUPABASE_URL para voltar ao seed local.",
    );
  }
  return value;
}

let publicInstance: SupabaseClient | null = null;
let serviceInstance: SupabaseClient | null = null;

export function publicClient(): SupabaseClient {
  publicInstance ??= createClient(
    required("NEXT_PUBLIC_SUPABASE_URL", url),
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey),
    { auth: { persistSession: false } },
  );
  return publicInstance;
}

export function serviceClient(): SupabaseClient {
  serviceInstance ??= createClient(
    required("NEXT_PUBLIC_SUPABASE_URL", url),
    required("SUPABASE_SERVICE_ROLE_KEY", serviceKey),
    { auth: { persistSession: false } },
  );
  return serviceInstance;
}
