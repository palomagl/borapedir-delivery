import { notFound } from "next/navigation";
import { LoyaltyCard } from "@/components/store/loyalty-card";
import { loyaltyState } from "@/server/loyalty/service";
import { loadStore } from "@/server/store-data";
export const metadata={title:"Clube ROXO"};
export default async function Page({params}:{params:Promise<{store:string}>}){const{store:slug}=await params;const store=await loadStore(slug);if(!store)notFound();const initial=await loyaltyState(store.id).catch(()=>null);return <LoyaltyCard storeSlug={slug} initialState={initial}/>;}
