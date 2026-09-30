import { redirect } from "next/navigation";
import { getDataSource } from "@/server/data";

/**
 * A raiz é o espaço da plataforma. Enquanto existe uma loja só, ela leva
 * direto para lá em vez de mostrar uma página vazia de marketing.
 */
export default async function PlatformHome() {
  const stores = await getDataSource().listStores();
  const first = stores[0];
  if (first) redirect(`/${first.slug}`);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[2rem] leading-none text-ink">Bora pedir</h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        Nenhuma loja cadastrada ainda.
      </p>
    </main>
  );
}
