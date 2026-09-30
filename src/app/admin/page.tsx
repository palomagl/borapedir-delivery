import { notFound, redirect } from "next/navigation";
import { getDataSource } from "@/server/data";

/**
 * Entrada da administração.
 *
 * Hoje resolve a primeira loja. Quando houver autenticação, a loja vem do
 * vínculo do usuário em `store_users` — a rota abaixo já é por loja, então
 * essa troca não mexe em nenhuma tela.
 */
export default async function AdminEntry() {
  const stores = await getDataSource().listStores();
  const first = stores[0];
  if (!first) notFound();

  redirect(`/admin/${first.slug}`);
}
