import { notFound } from "next/navigation";
import { RoxoCatalog } from "@/components/store/roxo-catalog";
import { loadCatalog, loadStore } from "@/server/store-data";
export default async function StorePage({ params, searchParams }: {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ categoria?: string; produto?: string }>;
}) {
  const [{ store: slug }, query] = await Promise.all([params, searchParams]);
  const store = await loadStore(slug);
  if (!store) notFound();
  return <RoxoCatalog catalog={await loadCatalog(store.id)} categorySlug={query.categoria} cupSlug={query.produto} />;
}
