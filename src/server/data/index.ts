import { seedDataSource } from "./seed-source";
import type { DataSource } from "./source";

export type { DataSource, NewOrder, OrderFilter } from "./source";

const hasSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Ponto único de troca de fonte de dados.
 *
 * Sem credenciais de Supabase o produto roda inteiro sobre o seed em memória —
 * é assim que se desenvolve a interface sem depender de infraestrutura.
 * Com credenciais, este é o único arquivo que muda para apontar ao banco.
 */
export function getDataSource(): DataSource {
  if (hasSupabase) {
    // O adaptador Supabase entra aqui assim que o projeto existir.
    // Até lá, falhar alto é melhor do que servir dados errados em silêncio.
    throw new Error(
      "Supabase configurado, mas o adaptador ainda não foi ligado. " +
        "Remova as variáveis NEXT_PUBLIC_SUPABASE_* para usar o seed local.",
    );
  }
  return seedDataSource;
}

/** Atalho de leitura — a maioria das páginas só precisa disto. */
export const data = {
  get source() {
    return getDataSource();
  },
};
