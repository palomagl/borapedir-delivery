/**
 * Resultado de uma server action.
 *
 * Fica fora dos arquivos "use server" de propósito: aqueles só podem exportar
 * funções assíncronas, e um tipo compartilhado não é uma delas.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
