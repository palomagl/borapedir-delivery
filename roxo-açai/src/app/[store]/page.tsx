import { notFound } from "next/navigation";
import { RoxoCatalog } from "@/components/store/roxo-catalog";
import { loadCatalog, loadStore } from "@/server/store-data";
export default async function StorePage({ params }: { params: Promise<{ store: string }> }) { const {store:slug}=await params; const store=await loadStore(slug); if(!store)notFound(); return <RoxoCatalog catalog={await loadCatalog(store.id)}/>; }
