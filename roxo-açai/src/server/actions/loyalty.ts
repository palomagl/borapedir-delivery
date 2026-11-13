"use server";
import { rateLimit } from "@/server/rate-limit";
import { clientKey } from "@/server/client-key";
import { getDataSource } from "@/server/data";
import { ensureLoyaltyAccount, loyaltyState } from "@/server/loyalty/service";
import type { LoyaltyState } from "@/domain/loyalty";
export async function readLoyalty(storeSlug: string): Promise<LoyaltyState | null> { const store = await getDataSource().getStoreBySlug(storeSlug); return store ? loyaltyState(store.id) : null; }
export async function joinLoyalty(storeSlug: string): Promise<LoyaltyState | null> { if (!rateLimit(`club:${await clientKey()}`,5,60).allowed) throw new Error("Aguarde um instante antes de tentar novamente."); const store = await getDataSource().getStoreBySlug(storeSlug); if (!store) return null; await ensureLoyaltyAccount(store.id); return loyaltyState(store.id); }
