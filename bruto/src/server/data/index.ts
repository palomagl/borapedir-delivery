import { isSupabaseConfigured } from "@/server/supabase/client";
import { seedDataSource } from "./seed-source";
import { supabaseDataSource } from "./supabase-source";
import type { DataSource } from "./source";

export type { DataSource, NewOrder, OrderFilter, SaveProductInput } from "./source";

/**
 * Ponto único de troca de fonte de dados.
 *
 * Sem credenciais de Supabase o produto inteiro roda sobre o seed em memória —
 * é assim que se desenvolve a interface sem depender de infraestrutura. Com as
 * variáveis definidas, passa a falar com o banco. Nenhuma tela sabe a
 * diferença.
 */
export function getDataSource(): DataSource {
  return isSupabaseConfigured() ? supabaseDataSource : seedDataSource;
}
