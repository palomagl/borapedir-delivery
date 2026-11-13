import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getDataSource } from "@/server/data";
import { isSupabaseConfigured, serviceClient } from "@/server/supabase/client";
import { loyaltyProgress, type LoyaltyState } from "@/domain/loyalty";
const COOKIE = "roxo_club";
type Account = { id: string; storeId: string; hash: string };
type Reservation = { id: string; accountId: string; state: "reserved" | "used" | "released"; expiresAt: number; orderId?: string };
const globalState = globalThis as typeof globalThis & { roxoClub?: { accounts: Map<string, Account>; reservations: Map<string, Reservation>; locks: Map<string, Promise<void>> } };
const state = globalState.roxoClub ??= { accounts: new Map(), reservations: new Map(), locks: new Map() };
const { accounts, reservations, locks } = state;
const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export async function currentLoyaltyAccount(storeId: string): Promise<Account | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const hash = hashToken(token);
  if (!isSupabaseConfigured()) { const account = accounts.get(hash); return account?.storeId === storeId ? account : null; }
  const { data, error } = await serviceClient().from("roxo_loyalty_accounts").select("id").eq("store_id", storeId).eq("token_hash", hash).maybeSingle();
  if (error) throw new Error("Não foi possível consultar o cartão de fidelidade.");
  return data ? { id: data.id, storeId, hash } : null;
}
export async function ensureLoyaltyAccount(storeId: string): Promise<Account> {
  const existing = await currentLoyaltyAccount(storeId); if (existing) return existing;
  const token = randomBytes(32).toString("base64url"); const account = { id: randomUUID(), storeId, hash: hashToken(token) };
  if (isSupabaseConfigured()) {
    const { error } = await serviceClient().from("roxo_loyalty_accounts").insert({ id: account.id, store_id: storeId, token_hash: account.hash });
    if (error) throw new Error("Não foi possível ativar o cartão de fidelidade.");
  } else accounts.set(account.hash, account);
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return account;
}
async function accountProgress(account: Account) {
  if (isSupabaseConfigured()) {
    const client = serviceClient();
    const [credit, used] = await Promise.all([
      client.from("roxo_loyalty_credits").select("order_id", { count: "exact", head: true }).eq("account_id", account.id).eq("store_id", account.storeId),
      client.from("roxo_loyalty_redemptions").select("id,state,expires_at").eq("account_id", account.id).eq("store_id", account.storeId).in("state", ["used", "reserved"]),
    ]);
    if (credit.error || used.error) throw new Error("Não foi possível atualizar a fidelidade.");
    const valid = (used.data ?? []).filter(r => r.state === "used" || new Date(r.expires_at).getTime() > Date.now());
    return loyaltyProgress(credit.count ?? 0, valid.length);
  }
  const orders = await getDataSource().listOrders(account.storeId, { statuses: ["delivered"] });
  const completed = new Set(orders.filter(o => o.loyaltyAccountId === account.id && !o.loyaltyRedemptionId && o.totalCents > 0).map(o => o.id)).size;
  const used = [...reservations.values()].filter(r => r.accountId === account.id && (r.state === "used" || (r.state === "reserved" && r.expiresAt > Date.now()))).length;
  return loyaltyProgress(completed, used);
}
export async function loyaltyState(storeId: string): Promise<LoyaltyState> {
  const account = await currentLoyaltyAccount(storeId);
  return { joined: !!account, ...(account ? await accountProgress(account) : loyaltyProgress(0, 0)), demo: !isSupabaseConfigured() };
}
export async function reserveReward(account: Account): Promise<string> {
  if (isSupabaseConfigured()) {
    const { data, error } = await serviceClient().rpc("roxo_reserve_reward", { p_account: account.id, p_store: account.storeId });
    if (error || !data) throw new Error("Você ainda não tem uma recompensa disponível ou ela já está sendo usada.");
    return data as string;
  }
  // Serialize check + reservation so two concurrent checkouts cannot spend one reward.
  const previous = locks.get(account.id) ?? Promise.resolve();
  let unlock!: () => void; const next = new Promise<void>(resolve => { unlock = resolve; }); locks.set(account.id, next);
  await previous;
  try {
    const state = await accountProgress(account); if (state.available < 1) throw new Error("Você ainda não tem uma recompensa disponível.");
    const id = randomUUID(); reservations.set(id, { id, accountId: account.id, state: "reserved", expiresAt: Date.now() + 15 * 60_000 }); return id;
  } finally { unlock(); if (locks.get(account.id) === next) locks.delete(account.id); }
}
export async function releaseReward(id: string, account: Account) {
  if (isSupabaseConfigured()) {
    const { error } = await serviceClient().from("roxo_loyalty_redemptions").update({ state: "released" }).eq("id", id).eq("account_id", account.id).eq("state", "reserved");
    if (error) console.error("loyalty reservation release failed");
  } else { const r = reservations.get(id); if (r?.accountId === account.id && r.state === "reserved") r.state = "released"; }
}
export function commitSeedReward(id: string, orderId: string) { const r = reservations.get(id); if (r?.state === "reserved") { r.state = "used"; r.orderId = orderId; } }
export function cancelSeedReward(id: string) { const r = reservations.get(id); if (r) r.state = "released"; }
