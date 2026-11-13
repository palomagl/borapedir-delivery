import {describe,it,expect,beforeEach,vi} from "vitest";
import {loyaltyProgress} from "./loyalty";
const env=vi.hoisted(()=>({cookies:new Map<string,string>(), orders:[] as {id:string;loyaltyAccountId:string;loyaltyRedemptionId?:string;totalCents:number;status:string}[]}));
vi.mock("server-only",()=>({}));
vi.mock("next/headers",()=>({cookies:async()=>({get:(k:string)=>env.cookies.has(k)?{value:env.cookies.get(k)}:undefined,set:(k:string,v:string)=>env.cookies.set(k,v)})}));
vi.mock("@/server/supabase/client",()=>({isSupabaseConfigured:()=>false,serviceClient:()=>{throw Error("Unexpected database call")}}));
vi.mock("@/server/data",()=>({getDataSource:()=>({listOrders:async()=>env.orders.filter(o=>o.status==="delivered")})}));
import {ensureLoyaltyAccount,currentLoyaltyAccount,loyaltyState,reserveReward,releaseReward,commitSeedReward,cancelSeedReward} from "@/server/loyalty/service";
beforeEach(()=>{env.cookies.clear();env.orders.splice(0)});
function complete(accountId:string,n=10){for(let i=0;i<n;i++)env.orders.push({id:`${accountId}_${i}`,loyaltyAccountId:accountId,totalCents:1600,status:"delivered"});}
describe("fidelidade ROXO",()=>{
 it("libera 1 copo a cada 10 pedidos concluídos",()=>{expect(loyaltyProgress(9,0).available).toBe(0);expect(loyaltyProgress(10,0).available).toBe(1);expect(loyaltyProgress(21,1)).toMatchObject({available:1,stamps:1});});
 it("mantém o cartão e não aceita o ID público como credencial",async()=>{const a=await ensureLoyaltyAccount("store");expect((await ensureLoyaltyAccount("store")).id).toBe(a.id);expect(await currentLoyaltyAccount("other-store")).toBeNull();env.cookies.set("roxo_club",a.id);expect(await currentLoyaltyAccount("store")).toBeNull();});
 it("não conta pendentes, cancelados, pedidos com prêmio ou registros duplicados",async()=>{const a=await ensureLoyaltyAccount("store");complete(a.id,1);env.orders.push({...env.orders[0]});env.orders.push({id:"pending",loyaltyAccountId:a.id,totalCents:1600,status:"pending"},{id:"canceled",loyaltyAccountId:a.id,totalCents:1600,status:"canceled"},{id:"reward",loyaltyAccountId:a.id,loyaltyRedemptionId:"r",totalCents:300,status:"delivered"});expect((await loyaltyState("store")).completed).toBe(1);});
 it("não deixa gastar a mesma recompensa em dois checkouts simultâneos",async()=>{const a=await ensureLoyaltyAccount("store");complete(a.id);const results=await Promise.allSettled([reserveReward(a),reserveReward(a)]);expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1);expect((await loyaltyState("store")).available).toBe(0);});
 it("devolve a recompensa se o pedido falha ou é cancelado, sem duplicar saldo",async()=>{const a=await ensureLoyaltyAccount("store");complete(a.id);const first=await reserveReward(a);await releaseReward(first,a);expect((await loyaltyState("store")).available).toBe(1);const second=await reserveReward(a);commitSeedReward(second,"order");expect((await loyaltyState("store")).available).toBe(0);cancelSeedReward(second);cancelSeedReward(second);expect((await loyaltyState("store")).available).toBe(1);});
 it("outro cartão não consegue usar o saldo do primeiro",async()=>{const first=await ensureLoyaltyAccount("store");complete(first.id);env.cookies.clear();const second=await ensureLoyaltyAccount("store");await expect(reserveReward(second)).rejects.toThrow();expect((await loyaltyState("store")).available).toBe(0);});
});
