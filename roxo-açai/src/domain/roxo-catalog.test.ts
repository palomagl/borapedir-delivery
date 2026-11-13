import { describe, expect, it } from "vitest";
import { seedProducts, SIZES, INCLUDED, PREMIUM, seedStore } from "@/server/data/seed/catalog";
import { effectivePriceCents } from "./catalog";
import { validateSelections, type CartSelection } from "./cart";
function baseSelections(slug: string): CartSelection[] {
  return seedProducts.find(p=>p.slug===slug)!.optionGroups.flatMap(g=>{
    const o=g.options.find(o=>o.available&&o.priceDeltaCents===0);
    return g.minSelect===1&&o?[{groupId:g.id,groupName:g.name,optionId:o.id,optionName:o.name,priceDeltaCents:o.priceDeltaCents}]:[];
  });
}
describe("ROXO: regras do catálogo",()=>{
  it("oferece todos os tamanhos, sem sabores prontos",()=>{
    expect(SIZES.map(s=>s.ml)).toEqual([300,500,700,1000]);
    expect(INCLUDED).toEqual(["Banana","Morango","Kiwi","Abacaxi","Granola","Leite em pó","Leite condensado","M&M's","Oreo"]);expect(PREMIUM).toHaveLength(14);
    for(const s of SIZES){const p=seedProducts.find(p=>p.slug===s.slug)!;expect(p.optionGroups.find(g=>g.name==="Acompanhamentos inclusos")?.maxSelect).toBe(s.included);expect(validateSelections(p,baseSelections(s.slug))).toEqual([]);}
  });
  it("cobra exatamente os adicionais informados pela loja",()=>{
    expect(Object.fromEntries(PREMIUM)).toEqual({"Bis":400,"Brigadeiro de colher":600,"Chocoball":400,"Chocolate branco":600,"Chocolate branco com avelã":600,"Creme de avelã":600,"Creme de morango":600,"Creme de Ninho":700,"Creme de Oreo":600,"Creme de paçoca":800,"Nutella":1200,"Ovomaltine":400,"Paçoca":400,"Trento":400});
    expect(seedProducts.flatMap(p=>p.optionGroups.flatMap(g=>g.options.map(o=>o.name))).some(name=>/whey|granola sem açúcar|pistache|cupuaçu|aveia/i.test(name))).toBe(false);
  });
  it("bloqueia mais acompanhamentos gratuitos do que o limite do tamanho",()=>{
    const p=seedProducts.find(p=>p.slug==="copo-300")!;const g=p.optionGroups.find(g=>g.name==="Acompanhamentos inclusos")!;
    const selections=[...baseSelections(p.slug),...g.options.slice(0,4).map(o=>({groupId:g.id,groupName:g.name,optionId:o.id,optionName:o.name,priceDeltaCents:0}))];
    expect(validateSelections(p,selections).length).toBeGreaterThan(0);
  });
  it("inclui escolha de colher gratuita em todo açaí, inclusive combos",()=>{
    for(const p of seedProducts.filter(p=>p.categoryId!=="cat_bebidas")){const g=p.optionGroups.find(g=>g.name==="Colheres")!;expect(g.minSelect).toBe(1);expect(g.options.some(o=>o.name==="Sem colher")).toBe(true);expect(g.options.every(o=>o.priceDeltaCents===0)).toBe(true);}
  });
  it("calcula economia real de cada combo contra os mesmos copos avulsos",()=>{
    for(const [slug,unit,count] of [["dupla-300",1600,2],["dupla-500",2200,2],["trio-300",1600,3],["trio-500",2200,3]] as const){const p=seedProducts.find(p=>p.slug===slug)!;expect(p.priceCents).toBe(unit*count);expect(effectivePriceCents(p)).toBeLessThan(unit*count);const bases=p.optionGroups.filter(g=>g.name.endsWith(" · Base"));expect(bases).toHaveLength(count);expect(new Set(p.optionGroups.flatMap(g=>g.options.map(o=>o.id))).size).toBe(p.optionGroups.flatMap(g=>g.options).length);}
  });
  it("separa entrega e retirada e usa IDs únicos por opção",()=>{
    expect(seedStore.serviceModes).toEqual(["delivery","pickup"]);expect(seedStore.deliveryFeeCents).toBe(500);
    const ids=seedProducts.flatMap(p=>p.optionGroups.flatMap(g=>g.options.map(o=>o.id)));expect(new Set(ids).size).toBe(ids.length);
  });
});
